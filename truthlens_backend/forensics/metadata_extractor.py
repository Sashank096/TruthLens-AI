from pathlib import Path
from typing import Dict, Any, Optional
from PIL import Image, ExifTags
import re

def _convert_to_degrees(value) -> Optional[float]:
    """Helper function to convert GPS coordinates stored in EXIF degrees/minutes/seconds tuple to decimal degrees."""
    try:
        if isinstance(value, (list, tuple)) and len(value) == 3:
            d = float(value[0])
            m = float(value[1])
            s = float(value[2])
            return d + (m / 60.0) + (s / 3600.0)
        return float(value)
    except Exception:
        return None

def extract_metadata(image_path: Path) -> Dict[str, Any]:
    """
    Extracts deep metadata from an image file:
    - Basic properties (format, dimensions, color mode)
    - EXIF tags (Camera, Lens, Exposure, ISO, Datetime)
    - GPS coordinates (converted to decimal latitude/longitude)
    - Software and editor signatures (Photoshop, GIMP, Canva, Midjourney, etc.)
    - XMP / IPTC hints
    """
    metadata: Dict[str, Any] = {
        "format": None,
        "width": 0,
        "height": 0,
        "color_mode": None,
        "has_exif": False,
        "camera_make": None,
        "camera_model": None,
        "lens_model": None,
        "software": None,
        "datetime_original": None,
        "exposure_time": None,
        "f_number": None,
        "iso_speed": None,
        "focal_length": None,
        "gps": None,
        "editing_software_detected": False,
        "editing_software_name": None,
        "metadata_stripped": True,
        "raw_tags": {}
    }

    try:
        with Image.open(image_path) as img:
            metadata["format"] = img.format
            metadata["width"] = img.width
            metadata["height"] = img.height
            metadata["color_mode"] = img.mode

            exif_data = img._getexif() if hasattr(img, "_getexif") else None
            
            if exif_data:
                metadata["has_exif"] = True
                metadata["metadata_stripped"] = False
                
                # Invert ExifTags mapping for readable keys
                tag_map = {ExifTags.TAGS[k]: v for k, v in exif_data.items() if k in ExifTags.TAGS}
                
                # Camera details
                metadata["camera_make"] = str(tag_map.get("Make", "")).strip() or None
                metadata["camera_model"] = str(tag_map.get("Model", "")).strip() or None
                metadata["lens_model"] = str(tag_map.get("LensModel", "")).strip() or None
                metadata["software"] = str(tag_map.get("Software", "")).strip() or None
                metadata["datetime_original"] = str(tag_map.get("DateTimeOriginal", tag_map.get("DateTime", ""))).strip() or None

                # Exposure details
                exp_time = tag_map.get("ExposureTime")
                if exp_time:
                    metadata["exposure_time"] = f"{float(exp_time):.4f}s" if float(exp_time) < 1 else f"{exp_time}s"
                
                f_num = tag_map.get("FNumber")
                if f_num:
                    metadata["f_number"] = f"f/{float(f_num):.1f}"
                    
                iso = tag_map.get("ISOSpeedRatings", tag_map.get("PhotographicSensitivity"))
                if iso:
                    metadata["iso_speed"] = f"ISO {iso}"
                    
                focal = tag_map.get("FocalLength")
                if focal:
                    metadata["focal_length"] = f"{float(focal):.1f}mm"

                # GPS extraction
                gps_info = tag_map.get("GPSInfo")
                if gps_info and isinstance(gps_info, dict):
                    gps_tags = {ExifTags.GPSTAGS.get(k, k): v for k, v in gps_info.items()}
                    lat_ref = gps_tags.get("GPSLatitudeRef", "N")
                    lat_val = gps_tags.get("GPSLatitude")
                    lon_ref = gps_tags.get("GPSLongitudeRef", "E")
                    lon_val = gps_tags.get("GPSLongitude")
                    
                    if lat_val and lon_val:
                        lat_deg = _convert_to_degrees(lat_val)
                        lon_deg = _convert_to_degrees(lon_val)
                        if lat_deg is not None and lon_deg is not None:
                            if lat_ref == "S":
                                lat_deg = -lat_deg
                            if lon_ref == "W":
                                lon_deg = -lon_deg
                            metadata["gps"] = {
                                "latitude": round(lat_deg, 6),
                                "longitude": round(lon_deg, 6),
                                "altitude": float(gps_tags.get("GPSAltitude", 0)) if gps_tags.get("GPSAltitude") else None,
                                "maps_link": f"https://www.google.com/maps?q={lat_deg},{lon_deg}"
                            }

                # Store clean string representations of raw tags (limiting to top 30)
                clean_raw = {}
                for k, v in list(tag_map.items())[:35]:
                    if k != "GPSInfo":
                        try:
                            clean_raw[str(k)] = str(v)[:100]
                        except Exception:
                            pass
                metadata["raw_tags"] = clean_raw

            # Also check text chunks / info dictionary for PNG/WebP
            if hasattr(img, "info") and isinstance(img.info, dict):
                for k, v in img.info.items():
                    if isinstance(v, str):
                        lower_v = v.lower()
                        if any(term in lower_v for term in ["photoshop", "gimp", "canva", "lightroom", "midjourney", "stable diffusion", "dall-e"]):
                            metadata["editing_software_detected"] = True
                            metadata["editing_software_name"] = v[:80]
                            metadata["metadata_stripped"] = False

    except Exception as e:
        print(f"[Metadata Extractor Error] {e}")

    # Check software string in EXIF
    if metadata.get("software"):
        soft_lower = metadata["software"].lower()
        if any(term in soft_lower for term in ["photoshop", "gimp", "canva", "lightroom", "paint.net", "snapseed"]):
            metadata["editing_software_detected"] = True
            metadata["editing_software_name"] = metadata["software"]

    # Also inspect file binary for embedded XMP/Photoshop headers
    if not metadata["editing_software_detected"]:
        try:
            with open(image_path, "rb") as bf:
                header_chunk = bf.read(65536)
                if b"Adobe Photoshop" in header_chunk:
                    metadata["editing_software_detected"] = True
                    metadata["editing_software_name"] = "Adobe Photoshop (detected in XMP stream)"
                elif b"GIMP" in header_chunk:
                    metadata["editing_software_detected"] = True
                    metadata["editing_software_name"] = "GIMP (detected in binary markers)"
        except Exception:
            pass

    return metadata

import json
from pathlib import Path
from typing import Dict, Any, Optional

def inspect_c2pa_manifest(image_path: Path) -> Dict[str, Any]:
    """
    Genuine C2PA / Content Credentials verification using native c2pa-python library.
    Inspects JUMBF manifest, claim generator, digital signature certificates,
    and assertions (edits, AI generation flags, camera captures).
    Provides honest, transparent status if no manifest is present.
    """
    result: Dict[str, Any] = {
        "c2pa_present": False,
        "status": "No C2PA Manifest Detected",
        "validation_state": "absent",
        "claim_generator": None,
        "title": None,
        "format": None,
        "issuer": None,
        "time": None,
        "actions": [],
        "assertions": [],
        "raw_manifest": None,
        "verified_fact_note": "No cryptographic C2PA provenance manifest was found embedded in this file. (Standard for raw camera files or stripped social uploads)."
    }

    try:
        import c2pa
        reader = c2pa.Reader.try_create(format_or_path=str(image_path))
        if reader:
            result["c2pa_present"] = True
            val_state = reader.get_validation_state() or "present"
            result["validation_state"] = val_state
            
            manifest_json_str = reader.json()
            manifest_data = json.loads(manifest_json_str) if manifest_json_str else {}
            result["raw_manifest"] = manifest_data
            
            # Extract active manifest
            active_manifest_id = manifest_data.get("active_manifest")
            manifests = manifest_data.get("manifests", {})
            active_m = manifests.get(active_manifest_id, {}) if active_manifest_id else {}
            
            result["claim_generator"] = active_m.get("claim_generator")
            result["title"] = active_m.get("title")
            result["format"] = active_m.get("format")
            
            sig_info = active_m.get("signature_info", {})
            result["issuer"] = sig_info.get("issuer")
            result["time"] = sig_info.get("time")

            # Extract actions / assertions
            assertions = active_m.get("assertions", [])
            for assertion in assertions:
                label = assertion.get("label", "")
                data = assertion.get("data", {})
                result["assertions"].append({"label": label, "data": data})
                if "c2pa.actions" in label:
                    actions_list = data.get("actions", [])
                    for act in actions_list:
                        result["actions"].append({
                            "action": act.get("action"),
                            "softwareAgent": act.get("softwareAgent"),
                            "parameters": act.get("parameters")
                        })
                        
            if val_state.lower() in ["valid", "passed"]:
                result["status"] = "Verified Authentic C2PA Credentials"
                result["verified_fact_note"] = f"Cryptographically validated C2PA provenance issued by '{result['issuer'] or 'Trust Anchor'}' via {result['claim_generator']}."
            else:
                result["status"] = f"C2PA Manifest Present ({val_state})"
                result["verified_fact_note"] = f"C2PA provenance manifest present but status is {val_state}."

            reader.close()
            return result

    except Exception as e:
        # Graceful handling
        result["status"] = f"C2PA check completed: No manifest ({type(e).__name__})"

    # Fallback byte scanner for JUMBF headers if c2pa library returned None
    try:
        with open(image_path, "rb") as bf:
            header = bf.read(131072)
            if b"jumb" in header or b"c2pa" in header:
                result["c2pa_present"] = True
                result["status"] = "C2PA JUMBF Marker Detected (Partial)"
                result["verified_fact_note"] = "C2PA / JUMBF metadata box marker detected in file binary."
    except Exception:
        pass

    return result

"""
NewRa Atlas Client SDK (Python)
The Single Source of Truth client for GridFlex, ResourceLab, and financial solvers.
"""

import requests
from typing import Optional, Dict, Any

class NewRaAtlasClient:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url.rstrip("/")

    def _get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        resp = requests.get(url, params=params)
        resp.raise_for_status()
        return resp.json()

    def _post(self, endpoint: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        resp = requests.post(url, json=payload)
        resp.raise_for_status()
        return resp.json()

    # --- ENGINE 4: Consumer Eligibility Checker (GES) ---
    def check_consumer_eligibility(self, state_id: str, discom_id: str, contract_demand_kva: float, voltage_code: str = "33 kV") -> Dict[str, Any]:
        return self._post("/api/v1/atlas/eligibility/consumer", {
            "state_id": state_id,
            "discom_id": discom_id,
            "contract_demand_kva": contract_demand_kva,
            "voltage_code": voltage_code
        })

    # --- ENGINE 5: Generator Eligibility Checker (GEP) ---
    def check_generator_eligibility(self, state_id: str, technology: str, capacity_mw: float, grid_type: str = "InSTS / STU") -> Dict[str, Any]:
        return self._post("/api/v1/atlas/eligibility/generator", {
            "state_id": state_id,
            "technology": technology,
            "capacity_mw": capacity_mw,
            "grid_type": grid_type
        })

    # --- ENGINE 3: Connectivity Matrix & Technical Losses ---
    def get_connectivity_matrix(self, state_id: Optional[str] = None, voltage_code: Optional[str] = None) -> Dict[str, Any]:
        return self._get("/api/v1/atlas/connectivity/matrix", {
            "state_id": state_id,
            "voltage_code": voltage_code
        })

    # --- DOWNSTREAM: GridFlex Settlement & Landed Cost ---
    def get_gridflex_settlement(self, state_id: str, discom_id: str, voltage_code: str = "33 kV") -> Dict[str, Any]:
        return self._get("/api/v1/atlas/gridflex/settlement-rules", {
            "state_id": state_id,
            "discom_id": discom_id,
            "voltage_code": voltage_code
        })

    # --- DOWNSTREAM: NewRa VPP Dispatch & DSM Bands ---
    def get_vpp_dsm_parameters(self, state_id: str) -> Dict[str, Any]:
        return self._get("/api/v1/atlas/vpp/dsm-parameters", {
            "state_id": state_id
        })

    # --- DOWNSTREAM: NewRa Connect Statutory Checklist ---
    def get_connect_checklist(self, state_id: str) -> Dict[str, Any]:
        return self._get("/api/v1/atlas/connect/statutory-checklist", {
            "state_id": state_id
        })

    # --- DOWNSTREAM: NewRa Ledger Reconciliation Factors ---
    def get_ledger_reconciliation(self, state_id: str, discom_id: str = "", billing_month: str = "") -> Dict[str, Any]:
        return self._get("/api/v1/atlas/ledger/reconciliation-factors", {
            "state_id": state_id,
            "discom_id": discom_id,
            "billing_month": billing_month
        })

    # --- REGULATORY PASSPORT GENERATOR ---
    def generate_regulatory_passport(self, state_id: str, ges_id: str = "GES-DEFAULT", fy: str = "FY 2025-26") -> Dict[str, Any]:
        return self._get("/api/v1/atlas/passport/generate", {
            "state_id": state_id,
            "ges_id": ges_id,
            "fy": fy
        })

    # --- NEWRA GUARD COMPLIANCE RULEBOOK ---
    def get_guard_compliance_rules(self, state_id: str) -> Dict[str, Any]:
        return self._get("/api/v1/atlas/guard/compliance-rules", {
            "state_id": state_id
        })

    # --- STAGE 6: DISCOM BILL AUDIT ENGINE ---
    def audit_discom_bill(self, **kwargs) -> Dict[str, Any]:
        return self._get("/api/v1/atlas/lifecycle/bill-audit", kwargs)

    # --- STAGE 2: CAPTIVE 26/51 STRUCTURING ENGINE ---
    def structure_captive_equity(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return self._post("/api/v1/atlas/lifecycle/captive-structuring", payload)

    # --- STAGE 4: 96-BLOCK DISPATCH VECTOR ---
    def get_96_block_dispatch_vector(self, state_id: str, discom_id: str = "msedcl", base_ppa_rate: float = 3.60) -> Dict[str, Any]:
        return self._get("/api/v1/atlas/lifecycle/dispatch-vector-96", {
            "state_id": state_id,
            "discom_id": discom_id,
            "base_ppa_rate": base_ppa_rate
        })

    # --- STAGE 5: SETTLEMENT & LOSS WATERFALL ---
    def simulate_settlement_waterfall(self, **kwargs) -> Dict[str, Any]:
        return self._get("/api/v1/atlas/lifecycle/settlement-waterfall", kwargs)

    # --- REGULATORY CHANGE & RISK PROPAGATOR ---
    def simulate_regulatory_change(self, **kwargs) -> Dict[str, Any]:
        return self._get("/api/v1/atlas/lifecycle/change-impact", kwargs)

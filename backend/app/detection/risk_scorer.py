from typing import Dict, Any, List, Tuple

def calculate_risk_score(
    rule_severity: str,
    event_count: int,
    source_ip: str,
    username: str,
    is_malicious_ip: bool = False,
    is_admin_target: bool = False,
    additional_signals: List[str] = None
) -> Tuple[int, List[Dict[str, Any]]]:
    """
    Calculates dynamic risk score (0-100) and returns an itemized breakdown of scoring reasons.
    """
    score = 0
    factors = []

    # 1. Base Severity Weight
    severity_weights = {
        "LOW": 15,
        "MEDIUM": 35,
        "HIGH": 60,
        "CRITICAL": 85
    }
    base_val = severity_weights.get(rule_severity.upper(), 30)
    score += base_val
    factors.append({
        "factor": f"Base rule severity ({rule_severity.upper()})",
        "points": base_val
    })

    # 2. Event Frequency / Velocity
    if event_count >= 20:
        freq_points = 25
        reason = "Extremely high event frequency (>20 events)"
    elif event_count >= 10:
        freq_points = 20
        reason = "High event frequency (10+ events)"
    elif event_count >= 5:
        freq_points = 15
        reason = "Repeated suspicious event activity (5+ events)"
    elif event_count > 1:
        freq_points = 5
        reason = "Multiple associated event occurrences"
    else:
        freq_points = 0
        reason = None

    if freq_points > 0:
        score += freq_points
        factors.append({"factor": reason, "points": freq_points})

    # 3. Source Reputation / External Threat IP
    if is_malicious_ip or source_ip.startswith("185.") or source_ip.startswith("45."):
        intel_points = 20
        score += intel_points
        factors.append({
            "factor": f"Known suspicious / external source IP ({source_ip})",
            "points": intel_points
        })

    # 4. Asset / User Criticality
    if is_admin_target or (username and ("admin" in username.lower() or "root" in username.lower() or "sysadmin" in username.lower())):
        crit_points = 20
        score += crit_points
        factors.append({
            "factor": f"High-value administrative account targeted ({username})",
            "points": crit_points
        })

    # 5. Additional Behavioral Signals
    if additional_signals:
        for signal in additional_signals:
            signal_points = 10
            score += signal_points
            factors.append({
                "factor": signal,
                "points": signal_points
            })

    # Cap final score between 0 and 100
    final_score = min(100, max(0, score))
    return final_score, factors

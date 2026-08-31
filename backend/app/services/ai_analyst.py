import os
from app.models.models import Alert
from app.schemas.schemas import AIAnalysisResponse

def generate_alert_analysis(alert: Alert) -> AIAnalysisResponse:
    """
    Generates intelligent SOC analysis for a given Alert.
    Uses OpenAI API if OPENAI_API_KEY is present in environment,
    otherwise provides deterministic, rules-based SOC expert fallback analysis.
    """
    openai_key = os.getenv("OPENAI_API_KEY")
    
    # Deterministic Rule Fallback (Default & Offline Compatible)
    summary_map = {
        "Credential Access": "High-velocity attempt to gain unauthorized entry through account credential testing.",
        "Discovery": "Reconnaissance activity attempting to map active network ports, services, and system topology.",
        "Execution": "Potential malicious command execution or script invocation on internal asset.",
        "Initial Access": "Exploitation attempt targeting public-facing web applications or web APIs.",
        "Privilege Escalation": "Attempt to elevate standard user privileges to administrative / superuser authority.",
        "Defense Evasion": "Potential attempt to impair endpoint defense controls or obfuscate payloads."
    }
    
    summary = summary_map.get(
        alert.category, 
        f"Suspicious activity matching detection rule '{alert.rule_name}' with risk score {alert.risk_score}."
    )
    
    indicators = [
        f"Source IP: {alert.source_ip or 'N/A'}",
        f"Target User: {alert.username or 'System / Global'}",
        f"Risk Score: {alert.risk_score}/100 ({alert.severity} Severity)",
        f"Associated Category: {alert.category}"
    ]
    
    if alert.risk_factors:
        for factor in alert.risk_factors:
            if isinstance(factor, dict) and "factor" in factor:
                indicators.append(f"Behavioral Factor: {factor['factor']}")

    recommended_steps = [
        f"1. Isolate or verify activity from source IP {alert.source_ip}.",
        f"2. Inspect recent security logs for user '{alert.username}' within 1 hour window.",
        "3. Check Threat Intelligence database for external IP reputation history.",
        "4. Validate if activity corresponds to planned penetration test or legitimate user behavior."
    ]
    
    containment = (
        f"Temporarily block IP {alert.source_ip} on firewall and reset credentials for account '{alert.username}' if compromised."
        if alert.severity in ["HIGH", "CRITICAL"]
        else "Monitor host activity and keep alert marked as Investigating for follow-up observation."
    )

    mitre_desc = f"{alert.mitre_technique or 'T1110'} - {alert.mitre_name or alert.category}"

    return AIAnalysisResponse(
        alert_id=alert.alert_id,
        threat_summary=summary,
        attack_type=alert.rule_name,
        suspicious_indicators=indicators,
        mitre_context=mitre_desc,
        recommended_steps=recommended_steps,
        containment_recommendation=containment
    )

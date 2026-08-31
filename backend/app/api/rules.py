from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import DetectionRule
from app.schemas.schemas import RuleResponse, RuleUpdate

router = APIRouter(prefix="/rules", tags=["Detection Rules"])

@router.get("", response_model=List[RuleResponse])
def get_rules(db: Session = Depends(get_db)):
    rules = db.query(DetectionRule).order_by(DetectionRule.id).all()
    return rules

@router.patch("/{rule_id}", response_model=RuleResponse)
def update_rule(rule_id: str, rule_update: RuleUpdate, db: Session = Depends(get_db)):
    rule = db.query(DetectionRule).filter(DetectionRule.rule_id == rule_id).first()
    if not rule and rule_id.isdigit():
        rule = db.query(DetectionRule).filter(DetectionRule.id == int(rule_id)).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Detection Rule not found")

    if rule_update.enabled is not None:
        rule.enabled = rule_update.enabled
    if rule_update.threshold is not None:
        rule.threshold = rule_update.threshold
    if rule_update.time_window is not None:
        rule.time_window = rule_update.time_window
    if rule_update.severity is not None:
        rule.severity = rule_update.severity

    db.commit()
    db.refresh(rule)
    return rule

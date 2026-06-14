#!/usr/bin/env python3
"""Generate pancreatic center snapshot artifacts.

The source JSON is curated manually from public evidence. This script applies
small deterministic normalizations, validates the data contract, and emits
Markdown, CSV, and SQL import artifacts for the 2026-06-13 quick demo.
"""

from __future__ import annotations

import csv
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT_JSON = ROOT / "data/pancreatic_centers/pancreatic_center_snapshot_2026-06-13.json"
SNAPSHOT_MD = ROOT / "data/pancreatic_centers/pancreatic_center_snapshot_2026-06-13.md"
SNAPSHOT_CSV = ROOT / "data/pancreatic_centers/pancreatic_center_snapshot_2026-06-13.csv"
SNAPSHOT_SQL = ROOT / "supabase/migrations/008_seed_pancreatic_center_snapshot_20260613.sql"


def load_snapshot() -> dict:
    with SNAPSHOT_JSON.open("r", encoding="utf-8") as f:
        return json.load(f)


def dump_snapshot(data: dict) -> None:
    with SNAPSHOT_JSON.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def replace_center_key(data: dict, old: str, new: str) -> None:
    for group in ("centers", "sources", "metrics"):
        for row in data[group]:
            if row.get("center_key") == old:
                row["center_key"] = new


def upsert(items: list[dict], key: str, row: dict) -> None:
    for idx, item in enumerate(items):
        if item[key] == row[key]:
            items[idx] = row
            return
    items.append(row)


def upsert_compound(items: list[dict], keys: tuple[str, ...], row: dict) -> None:
    for idx, item in enumerate(items):
        if all(item[k] == row[k] for k in keys):
            items[idx] = row
            return
    items.append(row)


def source(
    center_key: str,
    source_key: str,
    title: str,
    url: str,
    source_type: str,
    evidence_summary: str,
    published_at: str | None = None,
    verification_status: str = "single_source",
    confidence: str = "medium",
) -> dict:
    return {
        "center_key": center_key,
        "source_key": source_key,
        "source_title": title,
        "source_url": url,
        "source_type": source_type,
        "source_published_at": published_at,
        "accessed_at": "2026-06-13",
        "evidence_summary": evidence_summary,
        "verification_status": verification_status,
        "confidence": confidence,
    }


def metric(
    center_key: str,
    metric_key: str,
    name: str,
    value: float,
    unit: str,
    period: str,
    scope: str,
    definition: str,
    source_url: str,
    source_type: str,
    verification_status: str = "single_source",
    confidence: str = "medium",
    notes: str | None = None,
) -> dict:
    return {
        "center_key": center_key,
        "metric_key": metric_key,
        "metric_name": name,
        "metric_value": value,
        "metric_unit": unit,
        "metric_period": period,
        "metric_scope": scope,
        "metric_definition": definition,
        "source_url": source_url,
        "source_type": source_type,
        "verification_status": verification_status,
        "confidence": confidence,
        "notes": notes,
    }


def apply_curated_updates(data: dict) -> None:
    replace_center_key(data, "cn_shanghai_changhai_hpb", "cn_shanghai_changhai_hbp")

    collection_notes = data["snapshot"].setdefault("collection_notes", [])
    note = (
        "2026-06-13 second pass added Shanghai Zhongshan Hospital and Shanghai First "
        "People's Hospital as user-specified Shanghai pancreatic resources; the China "
        "Top 30 remains a public-signal candidate list, not a clinical ranking."
    )
    if note not in collection_notes:
        collection_notes.append(note)

    upsert(
        data["centers"],
        "center_key",
        {
            "center_key": "cn_shanghai_zhongshan_pancreatic_surgery",
            "region_group": "china",
            "country": "China",
            "province_state": "Shanghai",
            "city": "Shanghai",
            "hospital_name": "Zhongshan Hospital, Fudan University",
            "center_name": "Pancreatic Surgery / Pancreatic Tumor MDT",
            "department_name": "Pancreatic Surgery",
            "center_type": "specialty_department",
            "candidate_signal_rank": 16,
            "candidate_tier": "B",
            "public_signal_heat": 79,
            "heat_note": "Shanghai specialty-surgery and MDT signal; cumulative surgery and treatment figures are public-profile/media signals, not current annual volume.",
            "capability_tags": [
                "pancreatic_surgery",
                "pancreatic_cancer",
                "mdt",
                "endoscopic_ablation",
                "interventional_oncology",
                "guideline_signal",
            ],
            "complication_support_tags": [
                "endoscopy",
                "interventional_radiology",
                "nutrition",
                "biliary_obstruction",
                "pain",
            ],
            "trial_signal": "Medium-high. Public expert profile and MDT reports show guideline and comprehensive-treatment signal.",
            "wechat_signal": {"status": "not_collected"},
            "scale_summary": "Public reports describe a dedicated pancreatic surgery/MDT resource. Health Times reported more than 4,000 cumulative pancreatic surgeries as of the 2019 report; a People's Daily Health expert profile reports Liu Liang has completed more than 1,500 pancreatic cancer surgeries and more than 10,000 comprehensive treatments. Current annual center volume is not verified.",
            "verification_status": "mixed_sources_unverified_current_annual_volume",
            "confidence": "medium",
            "notes": "Included because the user explicitly requested Zhongshan Hospital pancreatic center coverage; follow-up should prioritize an official hospital department page.",
        },
    )

    upsert(
        data["centers"],
        "center_key",
        {
            "center_key": "cn_shanghai_shanghai_first_pancreatic_surgery",
            "region_group": "china",
            "country": "China",
            "province_state": "Shanghai",
            "city": "Shanghai",
            "hospital_name": "Shanghai General Hospital / Shanghai First People's Hospital",
            "center_name": "Pancreatic Surgery / Pancreatic Tumor MDT",
            "department_name": "General Surgery Pancreatic Surgery",
            "center_type": "specialty_department",
            "candidate_signal_rank": 17,
            "candidate_tier": "B",
            "public_signal_heat": 76,
            "heat_note": "Official hospital pages confirm pancreatic surgery subspecialty and clinic scheduling; scale signal is early-stage and lower-confidence.",
            "capability_tags": [
                "pancreatic_surgery",
                "pancreatic_tumor",
                "mdt",
                "minimally_invasive_surgery",
                "translational_research",
            ],
            "complication_support_tags": [
                "critical_care",
                "pathology",
                "imaging",
                "nutrition",
                "biliary_obstruction",
            ],
            "trial_signal": "Medium. Public source describes Shanghai Pancreatic Disease Key Laboratory support.",
            "wechat_signal": {"status": "not_collected"},
            "scale_summary": "Official hospital pages confirm a pancreatic surgery subspecialty and dedicated clinic schedule. A public reprint says the team was formally established in 2021 and had completed more than 300 pancreatic tumor operations by early 2023; current annual volume is not verified.",
            "verification_status": "mixed_sources_unverified_current_annual_volume",
            "confidence": "medium",
            "notes": "Included because the user explicitly identified Shanghai First People's Hospital pancreatic center as part of the Shanghai resource layer.",
        },
    )

    rank_map = {
        "cn_shanghai_fudan_cancer_pancreatic_surgery": (1, "A"),
        "cn_shanghai_ruijin_pancreas_center": (2, "A"),
        "cn_shanghai_changhai_hbp": (3, "A"),
        "cn_nanjing_jsph_pancreas_center": (4, "A"),
        "cn_wuhan_union_pancreatic_surgery": (5, "A"),
        "cn_beijing_cicams_pancreatic_gastric_surgery": (6, "A"),
        "cn_shanghai_huashan_pancreatic_surgery": (7, "A"),
        "cn_chengdu_west_china_pancreatic_surgery": (8, "A"),
        "cn_hangzhou_zju1_hbp": (9, "A"),
        "cn_hangzhou_zhejiang_cancer_hbp": (10, "A"),
        "cn_guangzhou_gdgh_pancreas_center": (11, "A"),
        "cn_beijing_pumch_pancreas": (12, "B"),
        "cn_beijing_pku_cancer_hbp": (13, "B"),
        "cn_beijing_pla301_hbp": (14, "B"),
        "cn_tianjin_tmu_cancer_pancreatic_tumor": (15, "B"),
        "cn_shanghai_zhongshan_pancreatic_surgery": (16, "B"),
        "cn_shanghai_shanghai_first_pancreatic_surgery": (17, "B"),
        "cn_wuhan_tongji_biliary_pancreatic": (18, "B"),
        "cn_hangzhou_zhejiang_provincial_people_pancreas": (19, "B"),
        "cn_hangzhou_srrsh_pancreatic_surgery": (20, "B"),
        "cn_fuzhou_fjmu_union_general_surgery": (21, "B"),
        "cn_fuzhou_fujian_cancer_hbp": (22, "B"),
        "cn_shijiazhuang_hebei_med2_pancreas": (23, "B"),
        "cn_shijiazhuang_hebei_med4_cancer": (24, "B"),
        "cn_tianjin_tmu_general_pancreas": (25, "B"),
        "cn_chongqing_southwest_hpb": (26, "B"),
        "cn_chongqing_cqmu1_hbp": (27, "B"),
        "cn_guangzhou_sun_yat_sen_cancer_pancreatic": (28, "B"),
        "cn_guangzhou_sun_yat_sen_1_hbp": (29, "B"),
        "cn_xian_xjtu1_hbp": (30, "B"),
        "cn_guangzhou_nanfang_hbp": (None, "Alternate"),
        "cn_harbin_hmu1_pancreas": (None, "Alternate"),
    }
    for center in data["centers"]:
        if center["center_key"] in rank_map:
            rank, tier = rank_map[center["center_key"]]
            center["candidate_signal_rank"] = rank
            center["candidate_tier"] = tier
            if tier == "Alternate" and center["region_group"] == "china":
                center["notes"] = (center.get("notes") or "") + " Alternate pool after user-specified Shanghai centers were added to the public-signal Top 30."

    center_updates = {
        "cn_chengdu_west_china_pancreatic_surgery": {
            "scale_summary": "Official page reports more than 3,600 annual liver-biliary-pancreatic-spleen surgeries and a technical page reports 169 laparoscopic pancreatoduodenectomy procedures in 2018; current pancreas-only annual total is not verified.",
            "verification_status": "verified_official_broad_scope",
            "confidence": "high",
        },
        "cn_shanghai_ruijin_pancreas_center": {
            "scale_summary": "Public reports cite more than 2,500 pancreatic benign/malignant disease patients treated annually, more than 30,000 pancreatic cancer comprehensive treatment cases cumulatively, and more than 4,000 Da Vinci robotic pancreatic minimally invasive operations cumulatively.",
            "verification_status": "mixed_sources",
            "confidence": "high",
        },
        "cn_hangzhou_zju1_hbp": {
            "scale_summary": "Official page reports 13 wards, 500+ beds, more than 70,000 outpatient visits annually, more than 10,000 annual surgeries across hepatobiliary-pancreatic scope, more than 2,000 ERCP procedures, more than 3,000 interventional procedures, and more than 10,000 ultrasound-guided interventions/endoscopic ultrasound procedures.",
            "verification_status": "verified_official_broad_scope",
            "confidence": "high",
        },
        "cn_tianjin_tmu_cancer_pancreatic_tumor": {
            "scale_summary": "Official department profile describes the center as the largest pancreatic tumor diagnosis and treatment center in North China, with 60 beds, 12 doctors, more than 600 pancreatic surgeries per year, and more than 30,000 patients diagnosed/treated annually.",
            "verification_status": "verified_official_single_source",
            "confidence": "high",
        },
        "cn_chongqing_cqmu1_hbp": {
            "scale_summary": "Official page reports national key specialty, 233 beds, more than 50,000 annual outpatient visits, more than 7,000 surgeries, more than 1,500 ERCP procedures, and more than 150 laparoscopic pancreatic surgeries.",
            "verification_status": "verified_official_broad_scope",
            "confidence": "high",
        },
        "cn_guangzhou_sun_yat_sen_cancer_pancreatic": {
            "scale_summary": "Official department page reports an early-established pancreatobiliary tumor specialty in China, 44 beds, 10 doctors, and more than 500 pancreatobiliary tumor surgeries annually.",
            "verification_status": "verified_official_broad_scope",
            "confidence": "high",
        },
        "cn_guangzhou_sun_yat_sen_1_hbp": {
            "scale_summary": "Official page reports 44 beds, more than 1,200 annual admissions for pancreatic, biliary, spleen, and liver diseases, and about 1,000 open, robotic, and laparoscopic HBP operations per year.",
            "verification_status": "verified_official_broad_scope",
            "confidence": "high",
        },
    }
    for center in data["centers"]:
        if center["center_key"] in center_updates:
            center.update(center_updates[center["center_key"]])

    source_rows = [
        source(
            "cn_chengdu_west_china_pancreatic_surgery",
            "west_china_pancreatic_surgery_department",
            "胰腺外科 - 四川大学华西医院",
            "https://www.wchscu.cn/department_yxwk.html",
            "official_department_page",
            "Official department page reports 21 doctors, national/key-discipline signal, pancreatic tumors/inflammation scope, and more than 3,600 liver-biliary-pancreatic-spleen surgeries per year.",
            confidence="high",
        ),
        source(
            "cn_chengdu_west_china_pancreatic_surgery",
            "west_china_lpd_feature",
            "腹腔镜胰十二指肠切除术 - 四川大学华西医院",
            "https://www.wchscu.cn/public/diseases/31197.html",
            "official_technology_page",
            "Official technical page reports 169 laparoscopic pancreatoduodenectomy procedures in 2018 and more than 570 cumulative LPD cases at the time of the page.",
            confidence="high",
        ),
        source(
            "cn_tianjin_tmu_cancer_pancreatic_tumor",
            "tmu_cancer_pancreatic_tumor_department",
            "胰腺肿瘤科 - 天津市肿瘤医院",
            "https://www.tjmuch.com/system/2021/11/12/030009787.shtml",
            "official_department_page",
            "Department profile describes the center as the largest pancreatic tumor diagnosis and treatment center in North China, with 60 beds, 12 doctors, more than 600 pancreatic surgeries per year, and more than 30,000 patients diagnosed/treated annually.",
            confidence="high",
        ),
        source(
            "cn_beijing_pumch_pancreas",
            "pumch_pancreas_specialty",
            "胰腺专业 - 北京协和医院",
            "https://www.pumch.cn/detail/14238.html",
            "official_specialty_page",
            "Official specialty page reports PUMCH Pancreatic Surgery Center was established in 2002 and cumulative clinical experience includes more than 5,000 pancreatic cancer cases and more than 1,000 pancreatic endocrine tumor cases.",
            confidence="high",
        ),
        source(
            "cn_beijing_pumch_pancreas",
            "pumch_guo_junchao_profile",
            "郭俊超 - 北京协和医院",
            "https://www.pumch.cn/temporary/doctor_details/33245.html",
            "official_doctor_profile",
            "Official doctor profile reports more than 4,000 patients diagnosed/treated annually and more than 200 pancreatic surgeries annually in the doctor's clinical work.",
            confidence="medium",
        ),
        source(
            "cn_beijing_pku_cancer_hbp",
            "pku_cancer_hbp_training_2019",
            "北京大学肿瘤医院肝胆胰肿瘤外科治疗学习班",
            "https://teach.bjcancer.org/Html/ContinuingMedicalSubjects/Detail/48.html",
            "official_training_page",
            "Official teaching page reports Hepatobiliary-Pancreatic Surgery I was founded in 1996 and has 33 beds and 13 physicians.",
            confidence="medium",
        ),
        source(
            "cn_shanghai_zhongshan_pancreatic_surgery",
            "zhongshan_health_times_2019_mdt",
            "复旦大学附属中山医院：胰腺肿瘤MDT门诊效果好",
            "https://www.jksb.com.cn/html/2019/newspaper_0111/136373.html",
            "authoritative_health_media",
            "Health Times reports the core pancreatic surgery department had completed more than 4,000 pancreatic operations over 14 years and used MDT clinic workflow.",
            published_at="2019-01-11",
            confidence="medium",
        ),
        source(
            "cn_shanghai_zhongshan_pancreatic_surgery",
            "zhongshan_people_health_liuliang",
            "复旦大学附属中山医院胰腺外科主任 - 刘亮",
            "https://doctor.peopledailyhealth.com/like/item/1010",
            "authoritative_health_profile",
            "People's Daily Health profile reports Liu Liang is Zhongshan Hospital pancreatic surgery director and has completed more than 1,500 pancreatic cancer surgeries and more than 10,000 comprehensive treatments.",
            confidence="medium",
        ),
        source(
            "cn_shanghai_zhongshan_pancreatic_surgery",
            "zhongshan_haodf_pancreatic_surgery",
            "胰腺外科 - 复旦大学附属中山医院",
            "https://www.haodf.com/hospital/420/keshi/9597810608.html",
            "third_party_department_registry",
            "Department registry reports pancreatic cancer survival indicators and endoscopy/intervention collaboration signals; used only as a supplementary source.",
            confidence="low",
        ),
        source(
            "cn_shanghai_shanghai_first_pancreatic_surgery",
            "shanghai_first_department_structure",
            "学科建设 - 上海市第一人民医院",
            "https://www.firsthospital.cn/Content/Depart/61",
            "official_department_page",
            "Official page reports the general surgery center has seven subspecialties including pancreatic surgery and 300 beds across south and north campuses.",
            confidence="high",
        ),
        source(
            "cn_shanghai_shanghai_first_pancreatic_surgery",
            "shanghai_first_sohu_pancreatic_surgery_2023",
            "胰腺外科主任龙江2月18日上午坐诊",
            "https://www.sohu.com/a/636401959_121118854",
            "third_party_reprint",
            "Public reprint states Shanghai First People's Hospital pancreatic surgery was established in 2021 and had completed more than 300 pancreatic tumor operations by early 2023; needs official cross-check.",
            published_at="2023-02-03",
            verification_status="needs_official_cross_check",
            confidence="low",
        ),
        source(
            "cn_wuhan_tongji_biliary_pancreatic",
            "tongji_hbp_department",
            "外科学（肝胆胰外科） - 华中科技大学同济医学院附属同济医院",
            "https://www.tjh.com.cn/channels/1390.html",
            "official_department_page",
            "Official page confirms Tongji Hospital hepatobiliary-pancreatic surgery disciplines including a biliary-pancreatic surgery specialty.",
            confidence="medium",
        ),
        source(
            "cn_wuhan_tongji_biliary_pancreatic",
            "tongji_qin_renyi_profile",
            "秦仁义 - 湖北省临床肿瘤学会",
            "https://www.esco.org.cn/view/273.html",
            "professional_society_profile",
            "Professional society profile identifies Qin Renyi as Tongji Hospital biliary-pancreatic surgery center director and HBP institute deputy director.",
            confidence="medium",
        ),
        source(
            "cn_hangzhou_zhejiang_provincial_people_pancreas",
            "zhejiang_provincial_gastro_pancreatic_guahao",
            "胃肠胰腺外科 - 浙江省人民医院",
            "https://js.guahaoe.com/department/c426b6ed-b1fd-47ae-a318-80d16f6a2b98000",
            "public_schedule_registry",
            "Public schedule registry confirms Zhejiang Provincial People's Hospital Gastrointestinal-Pancreatic Surgery clinic and pancreatic tumor services.",
            confidence="low",
        ),
        source(
            "cn_hangzhou_srrsh_pancreatic_surgery",
            "srrsh_hong_one_stitch_chinanews",
            "浙江医生发明“洪氏一针法” 术后死亡率5%降至1%以下",
            "https://www.chinanews.com.cn/m/sh/2019/02-16/8756021.shtml?f=qbapp",
            "authoritative_media",
            "China News report describes Sir Run Run Shaw Hospital Prof. Hong Defei, the Hong one-stitch method, and more than 400 laparoscopic pancreatoduodenectomy cases in less than four years.",
            published_at="2019-02-16",
            confidence="medium",
        ),
        source(
            "cn_hangzhou_srrsh_pancreatic_surgery",
            "srrsh_mayo_hpb_conference",
            "挑战“癌中之王”丨浙大邵逸夫医院主办肝胆胰疾病国际会议",
            "https://y.dxy.cn/v2/hospital/16/960542.html",
            "hospital_platform_news",
            "Hospital platform article reports SRRSH Mayo collaboration, pancreas tumor MDT center, severe pancreatitis center, and more than 200 severe pancreatitis admissions per year.",
            published_at="2024-06-12",
            confidence="medium",
        ),
        source(
            "cn_fuzhou_fujian_cancer_hbp",
            "fujian_cancer_hbp_haodf",
            "福建省肿瘤医院肝胆胰肿瘤外科专家",
            "https://www.haodf.com/hospital/723/keshi/4953586117/tuijian.html",
            "third_party_department_registry",
            "Public registry confirms a hepatobiliary-pancreatic tumor surgery department and pancreatic cancer surgical expertise; no center volume.",
            confidence="low",
        ),
        source(
            "cn_shijiazhuang_hebei_med2_pancreas",
            "hebei_med2_hbp_department",
            "普外一科（肝胆胰腺外科专业） - 河北医科大学第二医院",
            "https://www.hb2h.com/ksdh/wk/pwyk_gdyxwkzy.htm",
            "official_department_page",
            "Official page confirms hepatobiliary-pancreatic surgery specialty and pancreaticoduodenectomy / pancreatic disease surgery capability.",
            confidence="medium",
        ),
        source(
            "cn_shijiazhuang_hebei_med4_cancer",
            "hebei_med4_hbp_department",
            "肝胆外科 - 河北医科大学第四医院",
            "https://www.hbydsy.com/ksjs/ksdh/wk/gdwk.htm",
            "official_department_page",
            "Official department page identifies the department as Hebei hepatobiliary-pancreatic tumor diagnosis and treatment center, with pancreatic cancer and Whipple procedure capability.",
            confidence="medium",
        ),
        source(
            "cn_tianjin_tmu_general_pancreas",
            "tmu_general_hbp_team",
            "肝胆胰脾外科亚专业团队 - 天津医科大学总医院",
            "https://www.tjmugh.com.cn/system/2018/11/30/020006555.shtml",
            "official_department_page",
            "Official page describes the hepatobiliary-pancreatic-splenic subspecialty team and pancreatic tumor surgery capability.",
            confidence="medium",
        ),
        source(
            "cn_chongqing_cqmu1_hbp",
            "cqmu1_hbp_department",
            "肝胆外科 - 重庆医科大学附属第一医院",
            "https://www.hospital-cqmu.com/gw_ksjs_gdwk",
            "official_department_page",
            "Official page reports national key specialty, first quality-control pilot for liver and pancreatic cancer standardized diagnosis/treatment, 233 beds, more than 50,000 annual outpatient visits, more than 7,000 surgeries, more than 1,500 ERCP procedures, and more than 150 laparoscopic pancreatic surgeries.",
            confidence="high",
        ),
        source(
            "cn_chongqing_southwest_hpb",
            "southwest_hpb_research_report",
            "胰十二指肠切除术后早期胰瘘的影响及预测因素分析",
            "https://www.zpwz.net/html/2018/3/2018030.html",
            "peer_reviewed_case_series",
            "Study affiliation confirms Southwest Hospital HBP surgical research on pancreatoduodenectomy complications; no current center volume.",
            confidence="low",
        ),
        source(
            "cn_guangzhou_sun_yat_sen_cancer_pancreatic",
            "sysucc_pancreatobiliary_department",
            "科室简介 - 中山大学肿瘤防治中心胰胆外科",
            "https://sysucc.org.cn/department/introduction/43",
            "official_department_page",
            "Official department page reports an early-established pancreatobiliary tumor specialty in China, 44 beds, 10 doctors, and more than 500 pancreatobiliary tumor surgeries annually.",
            confidence="high",
        ),
        source(
            "cn_guangzhou_sun_yat_sen_1_hbp",
            "sysu1_biliary_pancreatic_department",
            "胆胰外科 - 中山大学附属第一医院",
            "https://www.fahsysu.org.cn/node/481",
            "official_department_page",
            "Official page reports 44 beds, more than 1,200 annual admissions for pancreatic/biliary/spleen/liver diseases, and about 1,000 open/robotic/laparoscopic HBP operations per year.",
            confidence="high",
        ),
        source(
            "cn_guangzhou_nanfang_hbp",
            "nanfang_hbp_doctor_profile",
            "王宇 - 南方医科大学南方医院肝胆外科",
            "https://www.haodf.com/doctor/251582.html",
            "third_party_doctor_profile",
            "Public profile confirms Nanfang Hospital hepatobiliary-pancreatic complex minimally invasive surgery capability including laparoscopic pancreatoduodenectomy.",
            confidence="low",
        ),
        source(
            "cn_xian_xjtu1_hbp",
            "xjtu1_hbp_changan_forum",
            "一附院成功举办2017中国肝胆胰脾外科长安论坛",
            "https://news.xjtu.edu.cn/info/1219/163484.htm",
            "university_news",
            "University news reports XJTU First Affiliated Hospital HBP surgery as a national key clinical specialty and describes early regional pancreatic tumor MDT and severe pancreatitis step-up treatment.",
            confidence="medium",
        ),
        source(
            "cn_xian_xjtu1_hbp",
            "xjtu1_ma_qingyong_2026",
            "我院肝胆外科马清涌教授再登“中国高被引学者”榜单",
            "https://www.jdyfy.com/info/1241/184801.htm",
            "official_hospital_news",
            "Official hospital news identifies Ma Qingyong as founder of the pancreatic surgery team at XJTU First Affiliated Hospital and highlights policy/guideline influence.",
            published_at="2026-03-01",
            confidence="medium",
        ),
        source(
            "cn_harbin_hmu1_pancreas",
            "hmu1_pancreatic_surgery_iags_2025",
            "哈医大一院孙备教授团队手术演示亮相国际医学舞台获国际同行认可",
            "https://hlj.news.cn/20251208/6c9718280aee431da7166e1690a0f24c/c.html",
            "authoritative_media",
            "Xinhua Heilongjiang report describes HMU First Hospital pancreatic surgery team robotic laparoscopic pancreatoduodenectomy demonstration at the 2025 International Digestive Surgery and HPB Surgery Annual Meeting.",
            published_at="2025-12-08",
            confidence="low",
        ),
        source(
            "us_md_anderson_pancreatic_cancer",
            "mdanderson_whipple_150",
            "Whipple procedure and pancreatic cancer treatment: 9 things to know",
            "https://www.mdanderson.org/cancerwise/whipple-procedure-and-pancreatic-cancer-treatment-9-things-to-know.h00-159459267.html",
            "official_center_education_page",
            "MD Anderson page states its surgeons perform more than 150 Whipple procedures per year.",
            published_at="2021-04-08",
            confidence="high",
        ),
        source(
            "jp_ncc_tokyo_pancreatic_oncology",
            "ncc_tokyo_2024_hbp_surgery_report",
            "Department of Hepatobiliary and Pancreatic Surgery - National Cancer Center Hospital",
            "https://www.ncc.go.jp/en/publication_report/2024/ncch/ncch16.html",
            "official_annual_report_page",
            "Official 2024 department report says the National Cancer Center Hospital HBP surgery department performs more than 400 surgical procedures each year.",
            confidence="high",
        ),
        source(
            "jp_shizuoka_cancer_hbp",
            "shizuoka_hbp_web_page",
            "Hepato-Biliary-Pancreatic Surgery - Shizuoka Cancer Center",
            "https://www.scchr.jp/en/division/division-of-hepato-biliary-pancreatic-surgery.html",
            "official_department_page",
            "Official department page reports more than 400 HBP tumor surgeries per year, including nearly 200 hepatectomies and more than 150 pancreatic resections.",
            confidence="high",
        ),
        source(
            "eu_humanitas_pancreatic_surgery",
            "humanitas_pancreatic_surgery_unit",
            "Pancreatic Surgery - Humanitas",
            "https://www.humanitas.net/units/pancreatic-surgery/",
            "official_department_page",
            "Official Humanitas page reports the Pancreatic Surgery Department performs 250 surgeries and sees more than 1,100 patients annually.",
            confidence="high",
        ),
        source(
            "us_siteman_pancreatic_cancer",
            "siteman_whipple_2013",
            "Treatments for Pancreatic Cancer - Siteman Cancer Center",
            "https://siteman.wustl.edu/treatment/cancer-types/pancreatic/treatments-for-pancreatic-cancer/",
            "official_center_page",
            "Official Siteman page reports surgeons performed 125 Whipple procedures in 2013.",
            confidence="medium",
        ),
    ]
    for row in source_rows:
        upsert_compound(data["sources"], ("center_key", "source_key"), row)

    if not any(c["center_key"] == "eu_humanitas_pancreatic_surgery" for c in data["centers"]):
        upsert(
            data["centers"],
            "center_key",
            {
                "center_key": "eu_humanitas_pancreatic_surgery",
                "region_group": "europe",
                "country": "Italy",
                "province_state": "Lombardy",
                "city": "Milan",
                "hospital_name": "Humanitas Research Hospital",
                "center_name": "Pancreatic Surgery Department",
                "department_name": "Pancreatic Surgery",
                "center_type": "international_reference_center",
                "candidate_signal_rank": None,
                "candidate_tier": "International",
                "public_signal_heat": 85,
                "heat_note": "Official department page discloses annual surgeries and patient visits.",
                "capability_tags": ["pancreatic_surgery", "pancreatic_disorders", "pancreatic_tumors", "multidisciplinary_care"],
                "complication_support_tags": ["nutrition", "oncology", "endoscopy", "postoperative_management"],
                "trial_signal": "Medium-high. Research hospital signal.",
                "wechat_signal": {"status": "not_applicable"},
                "scale_summary": "Official Humanitas page reports 250 pancreatic surgeries and more than 1,100 patients annually.",
                "verification_status": "verified_official_single_source",
                "confidence": "high",
                "notes": "Added in second pass as Europe benchmark with clear annual scale.",
            },
        )

    if not any(c["center_key"] == "us_siteman_pancreatic_cancer" for c in data["centers"]):
        upsert(
            data["centers"],
            "center_key",
            {
                "center_key": "us_siteman_pancreatic_cancer",
                "region_group": "us",
                "country": "United States",
                "province_state": "Missouri",
                "city": "St. Louis",
                "hospital_name": "Siteman Cancer Center / Washington University",
                "center_name": "Pancreatic Cancer Program",
                "department_name": "Pancreatic Cancer Surgery",
                "center_type": "international_reference_center",
                "candidate_signal_rank": None,
                "candidate_tier": "International",
                "public_signal_heat": 78,
                "heat_note": "Official center page gives a historical Whipple volume benchmark.",
                "capability_tags": ["pancreatic_cancer", "whipple", "medical_oncology", "radiation_oncology", "clinical_trial"],
                "complication_support_tags": ["nutrition", "pain", "biliary_obstruction", "palliative"],
                "trial_signal": "Medium-high.",
                "wechat_signal": {"status": "not_applicable"},
                "scale_summary": "Official Siteman page reports 125 Whipple procedures in 2013; current annual volume not verified.",
                "verification_status": "verified_historical_volume",
                "confidence": "medium",
                "notes": "Historical US high-volume comparator.",
            },
        )

    metric_rows = [
        metric(
            "cn_shanghai_ruijin_pancreas_center",
            "annual_pancreatic_disease_patients",
            "Annual pancreatic benign/malignant disease patients",
            2500,
            "patients/year lower_bound",
            "reported 2024",
            "pancreatic benign and malignant diseases",
            "Annual pancreatic disease patient volume reported by partner hospital news.",
            "https://www.hfyy.cn/col18/9666",
            "hospital_news_partner_page",
            confidence="medium",
            notes="Patient count, not surgery count.",
        ),
        metric(
            "cn_shanghai_ruijin_pancreas_center",
            "cumulative_comprehensive_pancreatic_cancer_treatments",
            "Cumulative comprehensive pancreatic cancer treatments",
            30000,
            "cumulative cases lower_bound",
            "reported 2025",
            "pancreatic cancer comprehensive treatments",
            "Cumulative comprehensive pancreatic cancer treatments reported by public media.",
            "https://www.peopleapp.com/rmharticle/30048930746",
            "authoritative_media",
            confidence="medium",
            notes="Cumulative treatment count, not annual surgery count.",
        ),
        metric(
            "cn_shanghai_ruijin_pancreas_center",
            "cumulative_robotic_pancreatic_operations",
            "Cumulative robotic pancreatic minimally invasive operations",
            4000,
            "cumulative operations lower_bound",
            "reported 2025",
            "Da Vinci robotic pancreatic minimally invasive operations",
            "Cumulative robotic pancreatic minimally invasive operations reported by public media.",
            "https://www.peopleapp.com/rmharticle/30048930746",
            "authoritative_media",
            confidence="medium",
            notes="Cumulative robotic operations, not annual center volume.",
        ),
        metric(
            "cn_chengdu_west_china_pancreatic_surgery",
            "annual_hbp_surgeries",
            "Annual liver-biliary-pancreatic-spleen surgeries",
            3600,
            "surgeries/year",
            "current official page, accessed 2026-06-13",
            "broad HBP and spleen surgery",
            "Annual operations covering liver, biliary, pancreatic, and spleen surgery in the pancreatic surgery department.",
            "https://www.wchscu.cn/department_yxwk.html",
            "official_department_page",
            confidence="high",
            notes="Broad HBP+spleen metric, not pancreas-only.",
        ),
        metric(
            "cn_chengdu_west_china_pancreatic_surgery",
            "lpd_2018",
            "Laparoscopic pancreatoduodenectomy procedures in 2018",
            169,
            "surgeries/year",
            "2018",
            "laparoscopic pancreatoduodenectomy",
            "Completed laparoscopic pancreatoduodenectomy procedures in 2018.",
            "https://www.wchscu.cn/public/diseases/31197.html",
            "official_technology_page",
            confidence="high",
        ),
        metric(
            "cn_tianjin_tmu_cancer_pancreatic_tumor",
            "annual_pancreatic_surgeries",
            "Annual pancreatic surgeries",
            600,
            "surgeries/year",
            "current department profile, accessed 2026-06-13",
            "pancreatic surgery",
            "Annual pancreatic surgery cases.",
            "https://www.tjmuch.com/system/2021/11/12/030009787.shtml",
            "official_department_page",
            confidence="high",
            notes="Source says more than 600.",
        ),
        metric(
            "cn_tianjin_tmu_cancer_pancreatic_tumor",
            "annual_diagnosed_treated_patients",
            "Annual diagnosed and treated patients",
            30000,
            "patients/year",
            "current department profile, accessed 2026-06-13",
            "department patients",
            "Annual patient diagnosis/treatment volume reported by the department profile.",
            "https://www.tjmuch.com/system/2021/11/12/030009787.shtml",
            "official_department_page",
            confidence="high",
            notes="Patient count is not surgery count.",
        ),
        metric(
            "cn_hangzhou_zju1_hbp",
            "annual_hbp_surgeries",
            "Annual HBP surgeries",
            10000,
            "surgeries/year lower_bound",
            "current official page, accessed 2026-06-13",
            "broad hepatobiliary-pancreatic surgery center",
            "Annual surgeries across the hepatobiliary-pancreatic surgery department.",
            "https://www.zy91.com/department/dept/73/5",
            "official_department_page",
            confidence="high",
            notes="Broad HBP metric, not pancreas-only.",
        ),
        metric(
            "cn_hangzhou_zju1_hbp",
            "annual_outpatient_visits",
            "Annual outpatient visits",
            70000,
            "visits/year lower_bound",
            "current official page, accessed 2026-06-13",
            "broad hepatobiliary-pancreatic surgery center",
            "Annual outpatient visits for the department.",
            "https://www.zy91.com/department/dept/73/5",
            "official_department_page",
            confidence="high",
            notes="Broad department metric.",
        ),
        metric(
            "cn_beijing_pumch_pancreas",
            "cumulative_pancreatic_cancer_cases",
            "Cumulative pancreatic cancer cases",
            5000,
            "cumulative cases",
            "40+ year clinical history as reported on official specialty page",
            "pancreatic cancer cases",
            "Cumulative pancreatic cancer cases diagnosed/treated by PUMCH pancreatic specialty.",
            "https://www.pumch.cn/detail/14238.html",
            "official_specialty_page",
            confidence="high",
            notes="Cumulative clinical experience, not annual volume.",
        ),
        metric(
            "cn_beijing_pumch_pancreas",
            "doctor_annual_pancreatic_surgeries",
            "Annual pancreatic surgeries in official doctor profile",
            200,
            "surgeries/year",
            "current official doctor profile, accessed 2026-06-13",
            "doctor/team clinical work",
            "Annual pancreatic surgeries described in an official PUMCH doctor profile.",
            "https://www.pumch.cn/temporary/doctor_details/33245.html",
            "official_doctor_profile",
            confidence="medium",
            notes="Doctor-profile metric, not full center volume.",
        ),
        metric(
            "cn_beijing_pku_cancer_hbp",
            "hbp1_beds",
            "HBP Surgery I beds",
            33,
            "beds",
            "official training page, accessed 2026-06-13",
            "Hepatobiliary-Pancreatic Surgery I",
            "Beds in the HBP Surgery I department.",
            "https://teach.bjcancer.org/Html/ContinuingMedicalSubjects/Detail/48.html",
            "official_training_page",
            confidence="medium",
            notes="Capacity metric, not volume.",
        ),
        metric(
            "cn_shanghai_zhongshan_pancreatic_surgery",
            "cumulative_pancreatic_operations_2019_report",
            "Cumulative pancreatic operations",
            4000,
            "cumulative surgeries lower_bound",
            "reported 2019",
            "department cumulative pancreatic operations",
            "Cumulative pancreatic operations over 14 years reported by Health Times.",
            "https://www.jksb.com.cn/html/2019/newspaper_0111/136373.html",
            "authoritative_health_media",
            confidence="medium",
            notes="Historical cumulative number, not current annual volume.",
        ),
        metric(
            "cn_shanghai_zhongshan_pancreatic_surgery",
            "liuliang_cumulative_pancreatic_cancer_surgeries",
            "Lead surgeon cumulative pancreatic cancer surgeries",
            1500,
            "cumulative surgeries lower_bound",
            "public profile accessed 2026-06-13",
            "lead surgeon pancreatic cancer operations",
            "Cumulative pancreatic cancer surgeries in public expert profile.",
            "https://doctor.peopledailyhealth.com/like/item/1010",
            "authoritative_health_profile",
            confidence="medium",
            notes="Lead-surgeon profile metric, not whole-center current volume.",
        ),
        metric(
            "cn_shanghai_shanghai_first_pancreatic_surgery",
            "cumulative_pancreatic_tumor_surgeries_2023_reprint",
            "Cumulative pancreatic tumor surgeries since 2021",
            300,
            "cumulative surgeries lower_bound",
            "2021-02-15 to early 2023, third-party reprint",
            "pancreatic tumor operations",
            "Cumulative pancreatic tumor operations since team establishment described by public reprint.",
            "https://www.sohu.com/a/636401959_121118854",
            "third_party_reprint",
            verification_status="needs_official_cross_check",
            confidence="low",
            notes="Low-confidence scale signal pending official cross-check.",
        ),
        metric(
            "cn_hangzhou_srrsh_pancreatic_surgery",
            "cumulative_lpd_less_than_4y",
            "Cumulative laparoscopic pancreatoduodenectomy cases",
            400,
            "cumulative surgeries lower_bound",
            "reported 2019, less than four years",
            "laparoscopic pancreatoduodenectomy",
            "Cumulative LPD cases described in China News report on Hong one-stitch method.",
            "https://www.chinanews.com.cn/m/sh/2019/02-16/8756021.shtml?f=qbapp",
            "authoritative_media",
            confidence="medium",
            notes="Historical cumulative technique metric.",
        ),
        metric(
            "cn_chongqing_cqmu1_hbp",
            "annual_laparoscopic_pancreatic_surgeries",
            "Annual laparoscopic pancreatic surgeries",
            150,
            "surgeries/year",
            "current official page, accessed 2026-06-13",
            "laparoscopic pancreatic surgery",
            "Annual laparoscopic pancreatic surgeries reported by the HBP department.",
            "https://www.hospital-cqmu.com/gw_ksjs_gdwk",
            "official_department_page",
            confidence="high",
            notes="Source says more than 150.",
        ),
        metric(
            "cn_guangzhou_sun_yat_sen_cancer_pancreatic",
            "annual_pancreatobiliary_tumor_surgeries",
            "Annual pancreatobiliary tumor surgeries",
            500,
            "surgeries/year",
            "current official page, accessed 2026-06-13",
            "pancreatobiliary tumor surgery",
            "Annual pancreatobiliary tumor operations performed by the pancreatobiliary surgery department.",
            "https://sysucc.org.cn/department/introduction/43",
            "official_department_page",
            confidence="high",
            notes="Broad pancreatobiliary tumor surgery metric, not pancreas-only.",
        ),
        metric(
            "cn_guangzhou_sun_yat_sen_1_hbp",
            "annual_hbp_operations",
            "Annual HBP operations",
            1000,
            "operations/year",
            "current official page, accessed 2026-06-13",
            "open, robotic, and laparoscopic HBP operations",
            "Annual HBP operations in the biliary-pancreatic surgery department.",
            "https://www.fahsysu.org.cn/node/481",
            "official_department_page",
            confidence="high",
            notes="Broad HBP operation metric.",
        ),
        metric(
            "cn_guangzhou_sun_yat_sen_1_hbp",
            "annual_admissions",
            "Annual admissions",
            1200,
            "patients/year",
            "current official page, accessed 2026-06-13",
            "pancreatic, biliary, spleen, and liver diseases",
            "Annual inpatient admissions for pancreatic/biliary/spleen/liver diseases.",
            "https://www.fahsysu.org.cn/node/481",
            "official_department_page",
            confidence="high",
            notes="Patient count is not surgery count.",
        ),
        metric(
            "us_md_anderson_pancreatic_cancer",
            "annual_whipple_procedures",
            "Annual Whipple procedures",
            150,
            "procedures/year lower_bound",
            "official education page accessed 2026-06-13",
            "Whipple procedures",
            "Annual Whipple procedure count at MD Anderson.",
            "https://www.mdanderson.org/cancerwise/whipple-procedure-and-pancreatic-cancer-treatment-9-things-to-know.h00-159459267.html",
            "official_center_education_page",
            confidence="high",
            notes="Source says more than 150.",
        ),
        metric(
            "jp_ncc_tokyo_pancreatic_oncology",
            "annual_hbp_surgical_procedures",
            "Annual HBP surgical procedures",
            400,
            "procedures/year lower_bound",
            "2024 official report",
            "HBP surgery department procedures",
            "Annual surgical procedures by the HBP surgery department.",
            "https://www.ncc.go.jp/en/publication_report/2024/ncch/ncch16.html",
            "official_annual_report_page",
            confidence="high",
            notes="Broad HBP metric, not pancreas-only.",
        ),
        metric(
            "jp_shizuoka_cancer_hbp",
            "annual_pancreatic_resections",
            "Annual pancreatic resections",
            150,
            "resections/year lower_bound",
            "current official page, accessed 2026-06-13",
            "pancreatic resections",
            "Annual pancreatic resections including pancreatoduodenectomy, distal pancreatectomy, and total pancreatectomy.",
            "https://www.scchr.jp/en/division/division-of-hepato-biliary-pancreatic-surgery.html",
            "official_department_page",
            confidence="high",
            notes="Source says more than 150.",
        ),
        metric(
            "eu_humanitas_pancreatic_surgery",
            "annual_pancreatic_surgeries",
            "Annual pancreatic surgeries",
            250,
            "surgeries/year",
            "current official page, accessed 2026-06-13",
            "pancreatic surgery department",
            "Annual surgeries performed by the Department of Pancreatic Surgery.",
            "https://www.humanitas.net/units/pancreatic-surgery/",
            "official_department_page",
            confidence="high",
        ),
        metric(
            "eu_humanitas_pancreatic_surgery",
            "annual_patients",
            "Annual patients",
            1100,
            "patients/year lower_bound",
            "current official page, accessed 2026-06-13",
            "pancreatic surgery department patients",
            "Annual patients seen by the Department of Pancreatic Surgery.",
            "https://www.humanitas.net/units/pancreatic-surgery/",
            "official_department_page",
            confidence="high",
        ),
        metric(
            "us_siteman_pancreatic_cancer",
            "whipple_procedures_2013",
            "Whipple procedures in 2013",
            125,
            "procedures/year",
            "2013",
            "Whipple procedures",
            "Whipple procedures performed in 2013.",
            "https://siteman.wustl.edu/treatment/cancer-types/pancreatic/treatments-for-pancreatic-cancer/",
            "official_center_page",
            confidence="medium",
            notes="Historical benchmark, not current annual volume.",
        ),
    ]
    for row in metric_rows:
        upsert_compound(data["metrics"], ("center_key", "metric_key"), row)

    data["centers"].sort(
        key=lambda c: (
            c["region_group"] != "china",
            c["candidate_signal_rank"] is None,
            c["candidate_signal_rank"] or 999,
            c["country"],
            c.get("city") or "",
            c["center_key"],
        )
    )


def validate_snapshot(data: dict) -> None:
    centers = {row["center_key"] for row in data["centers"]}
    missing_sources = [row for row in data["sources"] if row["center_key"] not in centers]
    missing_metrics = [row for row in data["metrics"] if row["center_key"] not in centers]
    if missing_sources or missing_metrics:
        raise ValueError(
            f"Missing center keys: sources={len(missing_sources)} metrics={len(missing_metrics)}"
        )

    china_ranks = sorted(
        row["candidate_signal_rank"]
        for row in data["centers"]
        if row["region_group"] == "china" and row.get("candidate_signal_rank") is not None
    )
    if china_ranks != list(range(1, 31)):
        raise ValueError(f"China public-signal ranks must be exactly 1..30, got {china_ranks}")

    for row in data["metrics"]:
        for field in ("metric_name", "metric_period", "metric_scope", "metric_definition", "source_url"):
            if not row.get(field):
                raise ValueError(f"Metric {row['center_key']}:{row['metric_key']} missing {field}")


def sources_for(data: dict, center_key: str) -> list[dict]:
    return [row for row in data["sources"] if row["center_key"] == center_key]


def metrics_for(data: dict, center_key: str) -> list[dict]:
    return [row for row in data["metrics"] if row["center_key"] == center_key]


def md_link(title: str, url: str) -> str:
    safe_title = title.replace("|", "\\|")
    return f"[{safe_title}]({url})"


def source_links(rows: list[dict], limit: int = 2) -> str:
    if not rows:
        return "待补"
    return "<br>".join(md_link(row["source_title"], row["source_url"]) for row in rows[:limit])


def metric_summary(rows: list[dict], limit: int = 3) -> str:
    if not rows:
        return "无公开量化指标"
    parts = []
    for row in rows[:limit]:
        value = row["metric_value"]
        value_str = str(int(value)) if float(value).is_integer() else str(value)
        parts.append(
            f"{row['metric_name']}: {value_str} {row['metric_unit']} ({row['metric_period']}; {row['metric_scope']})"
        )
    return "<br>".join(part.replace("|", "\\|") for part in parts)


def write_markdown(data: dict) -> None:
    snap = data["snapshot"]
    lines = [
        "# 胰腺治疗中心公开信号快照",
        "",
        f"- 快照日期：{snap['snapshot_date']}",
        f"- 采集时间：{snap['collected_at']}",
        "- 口径：公开信号候选清单，不是临床排名、医院推荐或疗效承诺。",
        "- 核心规则：任何手术量/治疗量必须保留指标名、数值、单位、时间、范围、定义、来源和验证状态。",
        "",
        "## 方法与边界",
        "",
        snap["methodology_note"],
        "",
        snap["disclaimer"],
        "",
        "### 本轮采集说明",
        "",
    ]
    for note in snap.get("collection_notes", []):
        lines.append(f"- {note}")

    lines.extend(
        [
            "",
            "## 中国 Top 30 胰腺中心公开信号候选清单",
            "",
            "| 序号 | 中心 | 城市 | 热度 | 公开规模摘要 | 量化指标 | 验证状态 | 主要来源 |",
            "| --- | --- | --- | ---: | --- | --- | --- | --- |",
        ]
    )
    china = [
        row
        for row in data["centers"]
        if row["region_group"] == "china" and row.get("candidate_signal_rank") is not None
    ]
    china.sort(key=lambda row: row["candidate_signal_rank"])
    for row in china:
        lines.append(
            "| {rank} | {name} / {center} | {city} | {heat} | {scale} | {metrics} | {status} / {confidence} | {sources} |".format(
                rank=row["candidate_signal_rank"],
                name=row["hospital_name"].replace("|", "\\|"),
                center=(row.get("center_name") or "").replace("|", "\\|"),
                city=f"{row.get('province_state') or ''} {row.get('city') or ''}".strip(),
                heat=row.get("public_signal_heat") or "",
                scale=(row.get("scale_summary") or "").replace("|", "\\|"),
                metrics=metric_summary(metrics_for(data, row["center_key"])),
                status=row["verification_status"],
                confidence=row["confidence"],
                sources=source_links(sources_for(data, row["center_key"])),
            )
        )

    lines.extend(
        [
            "",
            "## 中国候补池",
            "",
            "| 中心 | 城市 | 保留原因 | 验证状态 | 主要来源 |",
            "| --- | --- | --- | --- | --- |",
        ]
    )
    alternates = [
        row
        for row in data["centers"]
        if row["region_group"] == "china" and row.get("candidate_signal_rank") is None
    ]
    alternates.sort(key=lambda row: row["center_key"])
    for row in alternates:
        alt_name = row["hospital_name"].replace("|", "\\|")
        alt_notes = (row.get("notes") or "").replace("|", "\\|")
        alt_city = f"{row.get('province_state') or ''} {row.get('city') or ''}".strip()
        alt_sources = source_links(sources_for(data, row["center_key"]))
        lines.append(
            f"| {alt_name} | {alt_city} | {alt_notes} | {row['verification_status']} / {row['confidence']} | {alt_sources} |"
        )

    lines.extend(
        [
            "",
            "## 国际胰腺中心参考库",
            "",
            "| 区域 | 中心 | 国家/城市 | 热度 | 公开规模摘要 | 量化指标 | 验证状态 | 主要来源 |",
            "| --- | --- | --- | ---: | --- | --- | --- | --- |",
        ]
    )
    international = [row for row in data["centers"] if row["region_group"] != "china"]
    international.sort(key=lambda row: (row["region_group"], row["country"], row.get("city") or "", row["hospital_name"]))
    for row in international:
        lines.append(
            "| {region} | {name} / {center} | {country} {city} | {heat} | {scale} | {metrics} | {status} / {confidence} | {sources} |".format(
                region=row["region_group"],
                name=row["hospital_name"].replace("|", "\\|"),
                center=(row.get("center_name") or "").replace("|", "\\|"),
                country=row["country"],
                city=row.get("city") or "",
                heat=row.get("public_signal_heat") or "",
                scale=(row.get("scale_summary") or "").replace("|", "\\|"),
                metrics=metric_summary(metrics_for(data, row["center_key"])),
                status=row["verification_status"],
                confidence=row["confidence"],
                sources=source_links(sources_for(data, row["center_key"])),
            )
        )

    lines.extend(
        [
            "",
            "## 量化指标明细",
            "",
            "| 中心 | 指标 | 数值 | 单位 | 时间 | 范围 | 定义 | 来源 | 验证 |",
            "| --- | --- | ---: | --- | --- | --- | --- | --- | --- |",
        ]
    )
    center_name = {row["center_key"]: row["hospital_name"] for row in data["centers"]}
    for row in data["metrics"]:
        value = row["metric_value"]
        value_str = str(int(value)) if float(value).is_integer() else str(value)
        lines.append(
            "| {center} | {name} | {value} | {unit} | {period} | {scope} | {definition} | {source} | {status} / {confidence} |".format(
                center=center_name[row["center_key"]].replace("|", "\\|"),
                name=row["metric_name"].replace("|", "\\|"),
                value=value_str,
                unit=row["metric_unit"].replace("|", "\\|"),
                period=row["metric_period"].replace("|", "\\|"),
                scope=row["metric_scope"].replace("|", "\\|"),
                definition=row["metric_definition"].replace("|", "\\|"),
                source=md_link(row["source_type"], row["source_url"]),
                status=row["verification_status"],
                confidence=row["confidence"],
            )
        )

    lines.extend(
        [
            "",
            "## 来源附录",
            "",
            "| 中心 | 来源 | 类型 | 访问日 | 摘要 | 验证 |",
            "| --- | --- | --- | --- | --- | --- |",
        ]
    )
    for row in data["sources"]:
        lines.append(
            "| {center} | {source} | {type} | {accessed} | {summary} | {status} / {confidence} |".format(
                center=center_name.get(row["center_key"], row["center_key"]).replace("|", "\\|"),
                source=md_link(row["source_title"], row["source_url"]),
                type=row["source_type"],
                accessed=row["accessed_at"],
                summary=row["evidence_summary"].replace("|", "\\|"),
                status=row["verification_status"],
                confidence=row["confidence"],
            )
        )

    SNAPSHOT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_csv(data: dict) -> None:
    fieldnames = [
        "snapshot_date",
        "region_group",
        "candidate_signal_rank",
        "candidate_tier",
        "country",
        "province_state",
        "city",
        "hospital_name",
        "center_name",
        "department_name",
        "public_signal_heat",
        "scale_summary",
        "verification_status",
        "confidence",
        "capability_tags",
        "complication_support_tags",
        "metrics",
        "source_titles",
        "source_urls",
        "notes",
    ]
    with SNAPSHOT_CSV.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in data["centers"]:
            srcs = sources_for(data, row["center_key"])
            mets = metrics_for(data, row["center_key"])
            writer.writerow(
                {
                    "snapshot_date": data["snapshot"]["snapshot_date"],
                    "region_group": row["region_group"],
                    "candidate_signal_rank": row.get("candidate_signal_rank"),
                    "candidate_tier": row.get("candidate_tier"),
                    "country": row["country"],
                    "province_state": row.get("province_state"),
                    "city": row.get("city"),
                    "hospital_name": row["hospital_name"],
                    "center_name": row.get("center_name"),
                    "department_name": row.get("department_name"),
                    "public_signal_heat": row.get("public_signal_heat"),
                    "scale_summary": row.get("scale_summary"),
                    "verification_status": row["verification_status"],
                    "confidence": row["confidence"],
                    "capability_tags": ";".join(row.get("capability_tags") or []),
                    "complication_support_tags": ";".join(row.get("complication_support_tags") or []),
                    "metrics": " || ".join(
                        f"{m['metric_name']}={m['metric_value']} {m['metric_unit']} [{m['metric_period']}; {m['metric_scope']}]"
                        for m in mets
                    ),
                    "source_titles": " || ".join(s["source_title"] for s in srcs),
                    "source_urls": " || ".join(s["source_url"] for s in srcs),
                    "notes": row.get("notes"),
                }
            )


def sql_literal(value: object) -> str:
    if value is None:
        return "NULL"
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, bool):
        return "true" if value else "false"
    return "'" + str(value).replace("'", "''") + "'"


def sql_jsonb(value: object) -> str:
    return sql_literal(json.dumps(value, ensure_ascii=False, sort_keys=True)) + "::jsonb"


def sql_text_array(values: list[str]) -> str:
    if not values:
        return "array[]::text[]"
    return "array[" + ", ".join(sql_literal(v) for v in values) + "]::text[]"


def sql_date(value: str | None) -> str:
    return "NULL" if value is None else sql_literal(value) + "::date"


def write_sql(data: dict) -> None:
    snap = data["snapshot"]
    metadata = {
        "collection_notes": snap.get("collection_notes", []),
        "artifact_json": str(SNAPSHOT_JSON.relative_to(ROOT)),
        "artifact_markdown": str(SNAPSHOT_MD.relative_to(ROOT)),
        "artifact_csv": str(SNAPSHOT_CSV.relative_to(ROOT)),
        "center_count": len(data["centers"]),
        "source_count": len(data["sources"]),
        "metric_count": len(data["metrics"]),
    }
    lines = [
        "-- Seed pancreatic center public-signal snapshot.",
        "-- Generated by scripts/generate_pancreatic_center_snapshot.py.",
        "-- This is a public-signal candidate dataset, not a clinical ranking.",
        "",
        "begin;",
        "",
        "insert into public.pancreatic_center_snapshots (",
        "  snapshot_key, snapshot_date, collected_at, title, scope_note, methodology_note, disclaimer, metadata",
        ") values (",
        "  "
        + ", ".join(
            [
                sql_literal(snap["snapshot_key"]),
                sql_literal(snap["snapshot_date"]) + "::date",
                sql_literal(snap["collected_at"]) + "::timestamptz",
                sql_literal(snap["title"]),
                sql_literal(snap["scope_note"]),
                sql_literal(snap["methodology_note"]),
                sql_literal(snap["disclaimer"]),
                sql_jsonb(metadata),
            ]
        ),
        ") on conflict (snapshot_key) do update set",
        "  snapshot_date = excluded.snapshot_date,",
        "  collected_at = excluded.collected_at,",
        "  title = excluded.title,",
        "  scope_note = excluded.scope_note,",
        "  methodology_note = excluded.methodology_note,",
        "  disclaimer = excluded.disclaimer,",
        "  metadata = excluded.metadata;",
        "",
        "delete from public.pancreatic_center_snapshot_centers",
        f"where snapshot_id = (select id from public.pancreatic_center_snapshots where snapshot_key = {sql_literal(snap['snapshot_key'])});",
        "",
        "with snapshot as (",
        f"  select id from public.pancreatic_center_snapshots where snapshot_key = {sql_literal(snap['snapshot_key'])}",
        ")",
        "insert into public.pancreatic_center_snapshot_centers (",
        "  snapshot_id, center_key, region_group, country, province_state, city, hospital_name, center_name, department_name, center_type,",
        "  candidate_signal_rank, candidate_tier, public_signal_heat, heat_note, capability_tags, complication_support_tags,",
        "  trial_signal, wechat_signal, scale_summary, verification_status, confidence, notes, metadata",
        ")",
        "select",
        "  snapshot.id, v.center_key, v.region_group, v.country, v.province_state, v.city, v.hospital_name, v.center_name, v.department_name, v.center_type,",
        "  v.candidate_signal_rank, v.candidate_tier, v.public_signal_heat, v.heat_note, v.capability_tags, v.complication_support_tags,",
        "  v.trial_signal, v.wechat_signal, v.scale_summary, v.verification_status, v.confidence, v.notes, v.metadata",
        "from snapshot",
        "cross join (values",
    ]
    center_values = []
    for row in data["centers"]:
        center_values.append(
            "  ({})".format(
                ", ".join(
                    [
                        sql_literal(row["center_key"]),
                        sql_literal(row["region_group"]),
                        sql_literal(row["country"]),
                        sql_literal(row.get("province_state")),
                        sql_literal(row.get("city")),
                        sql_literal(row["hospital_name"]),
                        sql_literal(row.get("center_name")),
                        sql_literal(row.get("department_name")),
                        sql_literal(row.get("center_type")),
                        sql_literal(row.get("candidate_signal_rank")),
                        sql_literal(row.get("candidate_tier")),
                        sql_literal(row.get("public_signal_heat")),
                        sql_literal(row.get("heat_note")),
                        sql_text_array(row.get("capability_tags") or []),
                        sql_text_array(row.get("complication_support_tags") or []),
                        sql_literal(row.get("trial_signal")),
                        sql_jsonb(row.get("wechat_signal") or {}),
                        sql_literal(row.get("scale_summary")),
                        sql_literal(row.get("verification_status")),
                        sql_literal(row.get("confidence")),
                        sql_literal(row.get("notes")),
                        sql_jsonb({}),
                    ]
                )
            )
        )
    lines.append(",\n".join(center_values))
    lines.extend(
        [
            ") as v(",
            "  center_key, region_group, country, province_state, city, hospital_name, center_name, department_name, center_type,",
            "  candidate_signal_rank, candidate_tier, public_signal_heat, heat_note, capability_tags, complication_support_tags,",
            "  trial_signal, wechat_signal, scale_summary, verification_status, confidence, notes, metadata",
            ");",
            "",
            "with center_map as (",
            "  select c.id, c.center_key",
            "  from public.pancreatic_center_snapshot_centers c",
            "  join public.pancreatic_center_snapshots s on s.id = c.snapshot_id",
            f"  where s.snapshot_key = {sql_literal(snap['snapshot_key'])}",
            ")",
            "insert into public.pancreatic_center_snapshot_sources (",
            "  snapshot_center_id, source_key, source_title, source_url, source_type, source_published_at, accessed_at,",
            "  evidence_summary, verification_status, confidence, metadata",
            ")",
            "select",
            "  center_map.id, v.source_key, v.source_title, v.source_url, v.source_type, v.source_published_at, v.accessed_at,",
            "  v.evidence_summary, v.verification_status, v.confidence, v.metadata",
            "from center_map",
            "join (values",
        ]
    )
    source_values = []
    for row in data["sources"]:
        source_values.append(
            "  ({})".format(
                ", ".join(
                    [
                        sql_literal(row["center_key"]),
                        sql_literal(row["source_key"]),
                        sql_literal(row["source_title"]),
                        sql_literal(row["source_url"]),
                        sql_literal(row["source_type"]),
                        sql_date(row.get("source_published_at")),
                        sql_literal(row["accessed_at"]) + "::date",
                        sql_literal(row["evidence_summary"]),
                        sql_literal(row["verification_status"]),
                        sql_literal(row["confidence"]),
                        sql_jsonb({}),
                    ]
                )
            )
        )
    lines.append(",\n".join(source_values))
    lines.extend(
        [
            ") as v(",
            "  center_key, source_key, source_title, source_url, source_type, source_published_at, accessed_at,",
            "  evidence_summary, verification_status, confidence, metadata",
            ") on center_map.center_key = v.center_key;",
            "",
            "with center_map as (",
            "  select c.id, c.center_key",
            "  from public.pancreatic_center_snapshot_centers c",
            "  join public.pancreatic_center_snapshots s on s.id = c.snapshot_id",
            f"  where s.snapshot_key = {sql_literal(snap['snapshot_key'])}",
            ")",
            "insert into public.pancreatic_center_volume_metrics (",
            "  snapshot_center_id, metric_key, metric_name, metric_value, metric_unit, metric_period, metric_scope, metric_definition,",
            "  source_url, source_type, verification_status, confidence, notes, metadata",
            ")",
            "select",
            "  center_map.id, v.metric_key, v.metric_name, v.metric_value, v.metric_unit, v.metric_period, v.metric_scope, v.metric_definition,",
            "  v.source_url, v.source_type, v.verification_status, v.confidence, v.notes, v.metadata",
            "from center_map",
            "join (values",
        ]
    )
    metric_values = []
    for row in data["metrics"]:
        metric_values.append(
            "  ({})".format(
                ", ".join(
                    [
                        sql_literal(row["center_key"]),
                        sql_literal(row["metric_key"]),
                        sql_literal(row["metric_name"]),
                        sql_literal(row["metric_value"]),
                        sql_literal(row["metric_unit"]),
                        sql_literal(row["metric_period"]),
                        sql_literal(row["metric_scope"]),
                        sql_literal(row["metric_definition"]),
                        sql_literal(row["source_url"]),
                        sql_literal(row["source_type"]),
                        sql_literal(row["verification_status"]),
                        sql_literal(row["confidence"]),
                        sql_literal(row.get("notes")),
                        sql_jsonb({}),
                    ]
                )
            )
        )
    lines.append(",\n".join(metric_values))
    lines.extend(
        [
            ") as v(",
            "  center_key, metric_key, metric_name, metric_value, metric_unit, metric_period, metric_scope, metric_definition,",
            "  source_url, source_type, verification_status, confidence, notes, metadata",
            ") on center_map.center_key = v.center_key;",
            "",
            "commit;",
            "",
        ]
    )
    SNAPSHOT_SQL.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    data = load_snapshot()
    apply_curated_updates(data)
    validate_snapshot(data)
    dump_snapshot(data)
    write_markdown(data)
    write_csv(data)
    write_sql(data)
    print(
        json.dumps(
            {
                "json": str(SNAPSHOT_JSON.relative_to(ROOT)),
                "markdown": str(SNAPSHOT_MD.relative_to(ROOT)),
                "csv": str(SNAPSHOT_CSV.relative_to(ROOT)),
                "sql": str(SNAPSHOT_SQL.relative_to(ROOT)),
                "centers": len(data["centers"]),
                "sources": len(data["sources"]),
                "metrics": len(data["metrics"]),
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()

#!/usr/bin/env bash
# ==============================================================================
# PEER NOTEBOOK - US COPYRIGHT OFFICE (USCO) FORM TX SOURCE CODE DEPOSIT GENERATOR
# Statutory Compliance: 37 C.F.R. § 202.20(c)(2)(vii) & USCO Circular 61
# Author: H. Joe Abudayyeh <joe@peernotebook.com>
# Copyright (c) 2024-2026 Peer Notebook LLC. All rights reserved.
# ==============================================================================
set -euo pipefail

WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUTPUT_DIR="${WORKSPACE_ROOT}/docs/compliance"
OUTPUT_FILE="${OUTPUT_DIR}/usco_form_tx_deposit.txt"
TMP_COMBINED="${WORKSPACE_ROOT}/.usco_tmp_combined.txt"

mkdir -p "${OUTPUT_DIR}"
rm -f "${OUTPUT_FILE}" "${TMP_COMBINED}"

echo "================================================================================" >> "${OUTPUT_FILE}"
echo "UNITED STATES COPYRIGHT OFFICE - FORM TX IDENTIFYING PORTION DEPOSIT" >> "${OUTPUT_FILE}"
echo "Title of Work: Peer Notebook Behavioral Health Clinical Documentation Engine" >> "${OUTPUT_FILE}"
echo "Claimant / Author: Peer Notebook LLC (Principal Architect: H. Joe Abudayyeh)" >> "${OUTPUT_FILE}"
echo "Date of Creation: 2024-2026 | Jurisdictional Notice: 37 C.F.R. § 202.20" >> "${OUTPUT_FILE}"
echo "Confidential Information & Trade Secret Redactions Applied Pursuant to Circular 61" >> "${OUTPUT_FILE}"
echo "================================================================================" >> "${OUTPUT_FILE}"
echo "" >> "${OUTPUT_FILE}"

# Collect core repository source code files (TypeScript/JavaScript/React)
find "${WORKSPACE_ROOT}/src" "${WORKSPACE_ROOT}/api" -type f \( -name "*.ts" -o -name "*.tsx" \) \
  ! -name "*.test.ts" ! -name "*.spec.ts" | sort | while read -r filepath; do
    relpath="${filepath#"${WORKSPACE_ROOT}/"}"
    echo "/* --- BEGIN FILE: ${relpath} --- */" >> "${TMP_COMBINED}"
    # Redact potential secret strings or token patterns per HIPAA/Trade Secret guidelines
    sed -E \
      -e 's/(BREVO_API_KEY|SUPABASE_SERVICE_ROLE_KEY|JWT_SECRET|PRIVATE_KEY) *= *"[^"]*"/REDACTED_TRADE_SECRET_CREDENTIAL/g' \
      -e 's/(bearer|authorization|token) *: *"[^"]*"/REDACTED_BEARER_TOKEN/gi' \
      "${filepath}" | nl -ba -w6 -s": " >> "${TMP_COMBINED}"
    echo "/* --- END FILE: ${relpath} --- */" >> "${TMP_COMBINED}"
    echo "" >> "${TMP_COMBINED}"
done

TOTAL_LINES=$(wc -l < "${TMP_COMBINED}")
LINES_PER_PAGE=50
FIFTY_PAGES=$(( LINES_PER_PAGE * 50 ))
TWENTY_FIVE_PAGES=$(( LINES_PER_PAGE * 25 ))

echo "Total combined source lines processed: ${TOTAL_LINES}"

if [ "${TOTAL_LINES}" -le "${FIFTY_PAGES}" ]; then
  echo "/* SOURCE DEPOSIT: COMPLETE SOURCE CODE (< 50 PAGES / 2500 LINES) */" >> "${OUTPUT_FILE}"
  cat "${TMP_COMBINED}" >> "${OUTPUT_FILE}"
else
  echo "/* SOURCE DEPOSIT: FIRST 25 PAGES (LINES 1 TO ${TWENTY_FIVE_PAGES}) */" >> "${OUTPUT_FILE}"
  head -n "${TWENTY_FIVE_PAGES}" "${TMP_COMBINED}" >> "${OUTPUT_FILE}"
  echo "" >> "${OUTPUT_FILE}"
  echo "/* ============================================================================== */" >> "${OUTPUT_FILE}"
  echo "/* [TRADE SECRET & INTERMEDIATE PROPRIETARY CODE WITHHELD UNDER 37 C.F.R. § 202.20] */" >> "${OUTPUT_FILE}"
  echo "/* ============================================================================== */" >> "${OUTPUT_FILE}"
  echo "" >> "${OUTPUT_FILE}"
  echo "/* SOURCE DEPOSIT: LAST 25 PAGES (FINAL ${TWENTY_FIVE_PAGES} LINES) */" >> "${OUTPUT_FILE}"
  tail -n "${TWENTY_FIVE_PAGES}" "${TMP_COMBINED}" >> "${OUTPUT_FILE}"
fi

rm -f "${TMP_COMBINED}"

echo "Deposit generated successfully: ${OUTPUT_FILE}"
exit 0

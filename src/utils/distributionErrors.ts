const routingLabels: Record<string, string> = {
  VEHICLE_COMPANY_NOT_CONFIGURED: "이 입력 차종명에 수신 기업이 설정되지 않았습니다. 차종 설정에서 직접 등록하세요. 별칭 대상의 수신 설정은 상속되지 않습니다.",
  VEHICLE_NOT_FOUND: "입력 차종 또는 별칭에 연결된 NAS 차종 폴더가 없습니다. 실제 폴더명과 별칭을 확인하세요.",
  EO_NOT_FOUND: "입력 차종과 공통 루트 모두에서 정확히 일치하는 EO 폴더를 찾지 못했습니다.",
  COMPANY_NOT_FOUND: "이 차종에 설정된 수신 기업이 없거나 비활성 상태입니다. 수신 기업 설정을 확인하세요.",
  AMBIGUOUS_COMPANY: "입력 차종 또는 별칭이 여러 NAS 폴더에 연결됩니다. 실제 폴더명과 별칭을 확인하세요.",
  PART_PATH_INVALID: "EO 폴더가 올바른 부품 폴더 안에 있지 않습니다. NAS 경로를 확인하세요.",
};

export function routingIssueLabel(code: string, message: string) {
  return Object.hasOwn(routingLabels, code) ? routingLabels[code] : (message.trim() || `배포 대상을 확인할 수 없습니다. (${code})`);
}

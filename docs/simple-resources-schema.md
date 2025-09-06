# 간단한 학습 자료 DB 구조

## LearningResourcesTable
**Partition Key**: `certId` (String)  
**Sort Key**: `resourceId` (String)

### 교재 정보
```json
{
  "certId": "adsp",
  "resourceId": "book#1",
  "type": "book",
  "title": "ADsP 데이터분석 준전문가 완벽가이드 2024",
  "author": "김데이터",
  "url": "https://www.yes24.com/Product/Goods/123456789"
}
```

### 동영상 강의
```json
{
  "certId": "adsp", 
  "resourceId": "video#1",
  "type": "video",
  "title": "패스트캠퍼스 ADsP 완주반",
  "instructor": "박강사",
  "url": "https://fastcampus.co.kr/data_online_adsp"
}
```

### 무료 자료
```json
{
  "certId": "adsp",
  "resourceId": "free#1", 
  "type": "free",
  "title": "한국데이터산업진흥원 공식 가이드",
  "provider": "한국데이터산업진흥원",
  "url": "https://www.kdata.or.kr/info/info_04_view.html?field=title&keyword=&type=techreport&page=1&dbnum=183&mode=detail&type=techreport"
}
```

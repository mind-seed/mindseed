-- Seed script: resource 테이블에 테스트용 콘텐츠 200개를 삽입한다.
-- 카테고리 4종(DEPRESSION/ANXIETY/STRESS/OTHER)을 50개씩,
-- 타입 3종(ARTICLE/VIDEO/AUDIO)을 순환 배치한다.
-- created_at은 id가 클수록 과거가 되도록 1분씩 늦춰,
-- createdAt 기준 내림차순 정렬 시 id 1이 가장 최신이 된다.

INSERT INTO resource (title, type, category, url, created_at, updated_at)
SELECT
  (ARRAY[
    -- DEPRESSION
    '우울한 마음을 돌보는 생활 습관', '무기력한 하루를 위한 회복법', '감정 기록으로 마음 이해하기', '작은 성취로 시작하는 회복',
    -- ANXIETY
    '불안이 밀려올 때 호흡법', '걱정과 거리를 두는 연습', '불안의 신호 알아차리기', '마음을 진정시키는 스트레칭',
    -- STRESS
    '스트레스 해소를 위한 산책', '번아웃 신호 예방하기', '긴장 완화를 위한 이완법', '효율적인 휴식의 중요성',
    -- OTHER
    '건강한 수면 습관 만들기', '자존감을 회복하는 루틴', '하루 10분 마음 챙김', '나에게 맞는 일상 루틴 설계'
  ])[1 + ((n - 1) % 16)] || ' (' || n || ')',
  (CASE n % 3 WHEN 1 THEN 'ARTICLE' WHEN 2 THEN 'VIDEO' ELSE 'AUDIO' END)::resource_type_enum,
  (ARRAY['DEPRESSION', 'ANXIETY', 'STRESS', 'OTHER'])[1 + ((n - 1) % 4)]::resource_category_enum,
  'https://example.com/contents/' || n,
  now() - (n * interval '1 minute'),
  now() - (n * interval '1 minute')
FROM generate_series(1, 200) AS n;
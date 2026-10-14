/** 템플릿 원본이 있는 저장소. 저장소를 옮기거나 브랜치를 바꾸면 여기만 고친다. */
const REPO = 'https://github.com/namiruan/coldmail-preview';
const BRANCH = 'main';

/** 파일을 읽는 화면. 로그인 없이도 보이고, 편집 버튼이 한 클릭 거리에 있다. */
export const blobUrl = (path: string) => `${REPO}/blob/${BRANCH}/${path}`;

/** 파일을 고치는 화면. 로그인을 요구하고, 쓰기 권한이 없으면 fork 후 변경 제안으로 안내된다. */
export const editUrl = (path: string) => `${REPO}/edit/${BRANCH}/${path}`;

import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return <div className="page-state"><h1>페이지를 찾을 수 없습니다.</h1><Link className="button" to="/">홈으로</Link></div>;
}

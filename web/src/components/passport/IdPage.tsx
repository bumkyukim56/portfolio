import Image from "next/image";
import { site, fullName } from "@/data/site";

// The data page, laid out like the Korean passport's: header row, photo at the left,
// labelled fields in blue, the machine-readable lines at the foot. It carries BK's own
// details. The faint Hangul behind it is drawn, not a picture.
export default function IdPage() {
  const mrz1 = `P<KOR${site.surname}<<${site.givenNames}`.padEnd(44, "<");
  const mrz2 = `${site.passportNo}<KOR<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<`.slice(0, 44);

  return (
    <div data-ui className="id-page" aria-label="Identity page">
      <div className="id-ghost" aria-hidden="true">ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ ㅅ ㅈ ㅊ ㅇ</div>

      <div className="id-head">
        <span className="id-head-left">여권 <strong>PASSPORT</strong></span>
        <span className="id-head-right">대한민국 <strong>REPUBLIC OF KOREA</strong></span>
        <svg className="id-chip" viewBox="0 0 40 28" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="36" height="24" rx="3" />
            <circle cx="20" cy="14" r="5" />
            <path d="M4 14 h11 M25 14 h11" />
          </g>
        </svg>
      </div>

      <div className="id-body">
        <div className="id-photo">
          {site.photo ? (
            <Image src={site.photo} alt={fullName} width={240} height={300} className="h-full w-full object-cover" />
          ) : (
            <span className="id-photo-initials" aria-label="Photo to come">{site.shortName}</span>
          )}
        </div>

        <dl className="id-fields">
          <div className="id-row">
            <div><dt>종류/ Type</dt><dd>PM</dd></div>
            <div><dt>국가코드/ Country code</dt><dd>KOR</dd></div>
            <div><dt>여권번호/ Passport No.</dt><dd>{site.passportNo}</dd></div>
          </div>
          <div><dt>성/ Surname</dt><dd>{site.surname}</dd></div>
          <div><dt>이름/ Given names</dt><dd>{site.givenNames}</dd></div>
          {site.koreanName && (
            <div><dt>한글성명</dt><dd>{site.koreanName}</dd></div>
          )}
          <div className="id-row">
            <div><dt>국적/ Nationality</dt><dd>REPUBLIC OF KOREA</dd></div>
            <div><dt>거주지/ Residence</dt><dd>{site.location.toUpperCase()}</dd></div>
          </div>
          <div className="id-row">
            <div><dt>발급일/ Date of issue</dt><dd>{site.issued}</dd></div>
            <div><dt>발급관청/ Authority</dt><dd>{site.school.toUpperCase()}</dd></div>
          </div>
        </dl>
      </div>

      <pre className="id-mrz" aria-label="Machine readable zone">{`${mrz1}\n${mrz2}`}</pre>
    </div>
  );
}

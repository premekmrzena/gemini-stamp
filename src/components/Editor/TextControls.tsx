import Image from 'next/image';
import ColorPickerInput from './ColorPickerInput';

const FONT_OPTIONS = [
  { name: 'Moderní (Poppins)', value: 'Poppins' },
  { name: 'Elegantní (Playfair Display)', value: 'Playfair Display' },
  { name: 'Psací (Dancing Script)', value: 'Dancing Script' },
  { name: 'Retro (Righteous)', value: 'Righteous' },
];

type Props = {
  mainText: string;
  setMainText: (v: string) => void;
  textColor: string;
  setTextColor: (v: string) => void;
  fontSize: number;
  setFontSize: (v: number) => void;
  fontFamily: string;
  setFontFamily: (v: string) => void;
  textAlign: 'left' | 'center' | 'right';
  setTextAlign: (v: 'left' | 'center' | 'right') => void;
  useShadow: boolean;
  setUseShadow: (v: boolean) => void;
  checkboxId: string;
};

export default function TextControls({
  mainText, setMainText,
  textColor, setTextColor,
  fontSize, setFontSize,
  fontFamily, setFontFamily,
  textAlign, setTextAlign,
  useShadow, setUseShadow,
  checkboxId,
}: Props) {
  const sliderPercent = ((fontSize - 40) / 260) * 100;

  return (
    <>
      <div className="flex gap-[16px]">
        <textarea
          value={mainText}
          onChange={(e) => setMainText(e.target.value)}
          placeholder="Napište vlastní text"
          className="bg-secondary text-black rounded-[4px] p-4 style-body outline-none focus:ring-2 focus:ring-success resize-none w-[320px] h-[96px] placeholder:text-black300 placeholder:opacity-50"
        />
        <div className="flex flex-col justify-between py-1 h-[96px]">
          <button onClick={() => setTextAlign('left')}>
            <Image src={textAlign === 'left' ? '/images/align-left-active.svg' : '/images/align-left.svg'} alt="Left" width={24} height={24} />
          </button>
          <button onClick={() => setTextAlign('center')}>
            <Image src={textAlign === 'center' ? '/images/align-center-active.svg' : '/images/align-center.svg'} alt="Center" width={24} height={24} />
          </button>
          <button onClick={() => setTextAlign('right')}>
            <Image src={textAlign === 'right' ? '/images/align-right-active.svg' : '/images/align-right.svg'} alt="Right" width={24} height={24} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-[24px] w-[360px]">
        <div className="flex gap-[16px] h-[48px]">
          <div className="flex-1 relative">
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full h-full bg-secondary text-black rounded-[4px] pl-4 pr-10 style-body appearance-none outline-none focus:ring-2 focus:ring-success"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>{f.name}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="#0F172A" strokeWidth="1.5">
                <path d="M1 1.5L6 6.5L11 1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <ColorPickerInput value={textColor} onChange={setTextColor} />
        </div>

        <div className="flex items-center justify-between h-[24px]">
          <input
            type="range" min="40" max="300" value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="custom-fontSize-slider w-[200px]"
            style={{ background: `linear-gradient(to right, #059669 ${sliderPercent}%, #FDFBF7 ${sliderPercent}%)` }}
          />
          <div className="flex items-center gap-3">
            <input type="checkbox" id={checkboxId} checked={useShadow} onChange={(e) => setUseShadow(e.target.checked)} className="w-5 h-5 accent-success rounded-[4px]" />
            <label htmlFor={checkboxId} className="style-body text-secondary cursor-pointer hover:text-primary transition-colors">Zapnout stín</label>
          </div>
        </div>
      </div>
    </>
  );
}

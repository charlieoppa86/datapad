export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 text-center">
      <p className="mb-2 text-xs uppercase tracking-[0.2em] text-text-secondary">
        Datapad
      </p>
      <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-text-primary sm:text-5xl">
        같은 질문, 다른 답변
      </h1>
      <p className="mt-4 max-w-md text-sm text-text-secondary sm:text-base">
        Raw CSV와 AI-ready CSV에 같은 질문을 던져 LLM 답변이 어떻게 달라지는지
        나란히 비교합니다. 2-pane 업로드/결과 UI는 다음 작업에서 구현합니다.
      </p>
    </div>
  );
}

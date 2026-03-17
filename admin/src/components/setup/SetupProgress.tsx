'use client';

export type SetupProgressStep = {
  id: number;
  title: string;
};

export function SetupProgress({
  steps,
  currentStep,
}: {
  steps: readonly SetupProgressStep[];
  currentStep: number;
}) {
  return (
    <nav aria-label="Progresso do setup">
      <ol className="flex items-center gap-0 overflow-x-auto pb-2">
        {steps.map((s, index) => {
          const isCurrent = s.id === currentStep;
          const isPast = s.id < currentStep;
          const isLast = index === steps.length - 1;
          return (
            <li
              key={s.id}
              className="flex shrink-0 items-center"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`
                    flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all
                    ${isCurrent
                      ? 'bg-primary text-white ring-4 ring-primary/20'
                      : isPast
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-500'
                    }
                  `}
                >
                  {isPast ? (
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    s.id
                  )}
                </div>
                <span
                  className={`
                    mt-2 hidden max-w-[100px] text-center text-xs font-medium sm:block
                    ${isCurrent ? 'text-primary' : isPast ? 'text-gray-600' : 'text-gray-400'}
                  `}
                >
                  {s.title}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`mx-1 h-0.5 w-6 shrink-0 sm:w-10 lg:w-14 ${
                    isPast ? 'bg-primary' : 'bg-gray-200'
                  }`}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

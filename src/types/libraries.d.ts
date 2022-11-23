declare module "easy-ease" {
  interface EaseParams {
    startValue?: number;
    endValue?: number;
    durationMs?: number;
    onStep: (value: number) => void;
    onComplete?: () => void;
  }

  export default function ease(args: EaseParams): void;
}

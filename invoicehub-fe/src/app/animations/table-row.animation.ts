import { animation, trigger, style, state, transition, animate } from '@angular/animations'

/**
 * Table row fading animation when added (press + button)
 */
export const tableRowAnimation = {
    animate: trigger('fadeInOut', [
        state('void', style({
          opacity: 0
        })),
        transition('void <=> *', animate(500)),
      ])
}
    
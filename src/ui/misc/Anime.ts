import anime from 'animejs';

export function vibrate(targets: string, completion?: () => void) {
  anime({
    targets,
    translateX: [0, '-9px', 0, '9px', 0],
    duration: 200,
    direction: 'alternate',
    loop: 2,
    easing: 'easeOutQuad',
    complete: completion,
  });
}

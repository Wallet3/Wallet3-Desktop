import anime from 'animejs';

export function vibrate(targets: any) {
  anime({
    targets,
    translateX: [0, '-9px', 0, '9px', 0],
    duration: 200,
    direction: 'alternate',
    loop: 2,
    easing: 'easeOutQuad',
  });
}

import anime from 'animejs';

export function vibrate(targets: any) {
  anime({
    targets,
    translateX: ['-.25rem', '.25rem'],
    duration: 70,
    direction: 'alternate',
    loop: 7,
    easing: 'easeOutQuad',
  });
}

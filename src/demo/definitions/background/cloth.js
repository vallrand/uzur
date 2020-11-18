import { hashNoise } from '../../../lib/algorithms'

export const cloth = `
varying vec2 uvPass;
uniform float time;

uniform vec3 frontColor;
uniform vec3 backColor;

${hashNoise}

void main(){
    vec2 uv = uvPass;

    float scaleY = 2.0 - uv.y;
    float n1 = noise(vec2(uv.x * 3.0625 + time * 0.08, scaleY * uv.y * 12.25));
    float n2 = noise(vec2(uv.x * 3.5 + time * -0.02, scaleY * uv.y * 14.0));
    float n3 = noise(vec2(uv.x * 4.0 + time * 0.005, scaleY * uv.y * 16.0));

    float threshold = 1.12 * mix(n3 * n2 * n1 * 3.0, 1.56 * uv.y, 0.64);
    vec3 color = mix(frontColor, backColor, threshold);

    vec2 sunPosition = uv - vec2(0.75, 0.25);
    float sun = exp(-36.0 * dot(sunPosition, sunPosition));
    vec3 sunColor = mix(pow(frontColor, vec3(2.0)), vec3(1.0), 0.5) * sun;
    color += 0.48 * sunColor * (n1 + n2 + 0.24);

    gl_FragColor = vec4(color, 1.0);
}`
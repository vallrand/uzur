import { simpleNoise, fbm } from '../../../algorithms'

export const dissipateFilter = {
    frag: `
varying vec2 uvPass;
uniform sampler2D sampler;
uniform vec2 invResolution;

${simpleNoise}
${fbm({ octaves: 8 })}

uniform vec3 edgeColor;
uniform float edgeWidth;
uniform float time;

void main(){
    vec4 color = texture2D(sampler, uvPass);

    float offset = fbm(16.0 * uvPass) + time;

    float edge = smoothstep(1.0, 1.0 + edgeWidth, offset);
    float clear = smoothstep(1.0 + edgeWidth, 1.0 + 2.0 * edgeWidth, offset);

    color.rgb = mix(color.rgb, edgeColor * pow(2.0 * abs(edge - 0.5), 2.0), edge);
    color = mix(color, vec4(0.0), clear);

    gl_FragColor = color;    
}`
}
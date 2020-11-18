export const thresholdFilter = {
    frag: `
varying vec2 uvPass;
uniform sampler2D sampler;
uniform vec2 invResolution;

float band_threshold(float value, float scale){ return floor(value * scale) / scale; }

uniform vec4 edgeColor;
uniform float edgeWidth;
uniform float equipotential;

void main(){
    vec4 color = texture2D(sampler, uvPass);

    float edge = max(0.0, 1.0 - edgeWidth * abs(equipotential - color.a));

    color = color * smoothstep(equipotential - 0.05, equipotential, color.a);

    gl_FragColor = mix(color, edgeColor, edge);    
}`
}
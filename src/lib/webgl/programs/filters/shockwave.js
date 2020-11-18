export const shockwaveFilter = {
    frag: `
varying vec2 uvPass;
uniform sampler2D sampler;
uniform vec2 invResolution;

const float PI = ${Math.PI};

uniform float radius;
uniform float amplitude;
uniform float wavelength;
uniform vec2 center;

void main(){    
    vec2 direction = uvPass - center;
    float distance = length(direction);

    float difference = clamp((distance - radius) / (0.5 * wavelength), 0.0, 1.0);

    float p = 1.0 - pow(abs(difference), 2.0);

    vec2 displacement = normalize(direction) * sin(PI * difference) * amplitude * p;

    vec4 color = texture2D(sampler, uvPass + displacement);

    gl_FragColor = color;    
}`
}
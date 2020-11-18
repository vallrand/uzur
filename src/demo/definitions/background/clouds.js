export const clouds = `
varying vec2 uvPass;
uniform float time;

float random (in vec2 st){
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
}

float noise(in vec2 st){
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

#define octaves ${6}
float fbm(in vec2 p){
    float value = 0.0;
    float freq = 1.13;
    float amp = 0.57;    
    for (int i = 0; i < octaves; i++){
        value += amp * (noise((p - vec2(1.0)) * freq));
        freq *= 1.61;
        amp *= 0.47;
    }
    return value;
}

uniform vec3 backColor;
uniform vec3 frontColor;

void main(){
    vec2 uv = uvPass;
    vec2 direction = vec2(0.01, 0.0);

    uv += 0.001 * time * direction;

    vec2 offsetB = vec2(0.1 * time, uv.y * 5.0);
    vec2 offsetC = vec2(2.0 + 0.01 * time, -4.0);

    vec2 scaleB = (0.5 + uv.y * 0.5) * vec2(5.0);
    vec2 scaleC = vec2(1.25);

    float valueB = fbm((uv + 1.0) * scaleB + offsetB);
    float valueC = fbm((uv + valueB) * scaleC + offsetC);

    vec3 color = mix(frontColor, backColor, 1.12 * uvPass.y);
    vec3 clouds = mix(backColor, frontColor, 2.0 * pow(valueC, 2.0) - 0.5);
    color = mix(color, clouds, 0.4);
    
    gl_FragColor = vec4(color, 1.0);
}`
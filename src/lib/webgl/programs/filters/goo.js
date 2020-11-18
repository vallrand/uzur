const noise = `
float hash(in vec2 p){
    float h = dot(p,vec2(127.1,311.7));
    return fract(sin(h)*43758.5453123);
}

float noise(in vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    return -1.0+2.0*mix(
        mix(hash(i + vec2(0.0,0.0)),
            hash(i + vec2(1.0,0.0)), u.x),
        mix(hash( i + vec2(0.0,1.0)),
            hash(i + vec2(1.0,1.0)), u.x), u.y);
}`

const seascape = ({
    iterations,
    height,
    choppiness,
    frequency
}) => `
${noise}

float sea_octave(vec2 uv, float choppy){
    uv += noise(uv);
    vec2 wv = 1.0-abs(sin(uv));
    vec2 swv = abs(cos(uv));
    wv = mix(wv,swv,wv);
    return pow(1.0-pow(wv.x * wv.y,0.65),choppy);
}

const int ITERATIONS = ${iterations};
const float SEA_HEIGHT = ${height.toFixed(1)};
const float SEA_CHOPPY = ${choppiness.toFixed(1)};
const float SEA_FREQUENCY = ${frequency.toFixed(1)};
const mat2 octave_m = mat2(1.6,1.2,-1.2,1.6);

float waves(vec2 uv, float t) {
    float freq = SEA_FREQUENCY;
    float amp = SEA_HEIGHT;
    float choppy = SEA_CHOPPY;

    float d, h = 0.0;
    for(int i = 0; i < ITERATIONS; i++) {
        d = sea_octave((uv+t)*freq,choppy);
        d += sea_octave((uv-t)*freq,choppy);
        h += d * amp;
        uv *= octave_m;
        freq *= 2.0;
        amp *= 0.5;
        choppy = mix(choppy,1.0,0.2);
    }
    return 1.0 - h;
}

vec3 waterNormal(vec2 pos, float e, float depth, float t){
    vec2 ex = vec2(e, 0);
    float H = waves(pos.xy, t) * depth;
    vec3 a = vec3(pos.x, H, pos.y);
    return normalize(cross(normalize(a-vec3(pos.x - e, waves(pos.xy - ex.xy, t) * depth, pos.y)), 
                           normalize(a-vec3(pos.x, waves(pos.xy + ex.yx, t) * depth, pos.y + e))));
}`

export const gooFilter = {
    frag: `
varying vec2 uvPass;
uniform sampler2D sampler;
uniform vec2 invResolution;

uniform float time;
uniform vec3 seaColor;

const float edge = 0.64;
const float edgeWidth = 0.64;

${seascape({
    iterations: 3,
    height: 1.12 * 0.64,
    choppiness: 4,
    frequency: 0.9 * 0.16
})}

vec2 lambertPhong(in vec3 normal, in vec3 viewDirection, in vec3 lightDirection){
    float lambertian = max(0.0, dot(lightDirection, normal));
    float specular = 0.0;

    if(lambertian > 0.0){
        vec3 halfDirection = normalize(lightDirection + viewDirection);
        float specularAngle = max(0.0, dot(halfDirection, normal));
        specular = pow(specularAngle, 16.0);
    }
    return vec2(lambertian, specular);
}

vec4 band_threshold(vec4 value, vec4 scale){ return floor(value * scale + 0.5) / scale; }

void main(){
    vec4 color = texture2D(sampler, uvPass);
    vec2 uv = 2.0 * uvPass - 1.0;
    uv *= 0.25;
    uv.x += 0.05 * time;

    vec3 normal = waterNormal(36.0 * uv, 0.001, 16.0, time).xzy;
    vec3 lightDirection = normalize(vec3(0.05, -0.25, 1.0));
    vec3 viewDirection = normalize(vec3(uv, 4.0));

    float threshold = smoothstep(edge - edgeWidth, edge, color.a);
    normal = normalize(mix(vec3(0.0, 0.0, -1.0), normal, threshold));

    vec2 light = lambertPhong(normal, viewDirection, lightDirection);
    color = color * vec4(seaColor * light.x, min(1.0, 0.64 + light.x)) + vec4(vec3(1.0), color.a) * light.y;

    gl_FragColor = band_threshold(color, vec4(4.0, 4.0, 4.0, 32.0));
}`
}
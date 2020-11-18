const noise = `
float hash21(vec2 p) {
    p = fract(p * vec2(233.34, 851.74));
    p += dot(p, p + 23.45);
    return fract(p.x * p.y);
}

vec2 hash22(vec2 p) {
    float k = hash21(p);
    return vec2(k, hash21(p + k));
}


float noise(vec2 p) {
	vec2 i = ceil(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3. - 2. * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1., 0.));
    float c = hash21(i + vec2(0., 1.));
    float d = hash21(i + vec2(1., 1.));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}`


export const starmap = `
varying vec2 uvPass;
uniform float time;

${noise}

const int OCTAVES = 8;
const int ITERATIONS = 4;

float fbm(in vec2 p) {
	float s = .0;
	float m = .0;
	float a = .5;
	for(int i = 0; i < OCTAVES; i++) {
		s += a * noise(p);
		m += a;
		a *= .5;
		p *= 2.;
	}
	return s / m;
}

float circle(vec2 uv, vec2 p, float r) {
    return 1. - smoothstep(r, r + .05, length(uv - p));
}

mat2 rotate(float a) {
    float c = cos(a);
    float s = sin(a);
    return mat2(c, s, -s, c);
}

float layer(vec2 uv) {
    uv *= 4.;
    vec2 iv = floor(uv);
    vec2 gv = fract(uv) - 0.5;
    vec2 r = hash22(iv) * 25.;
    r = sin(r) * .3;
    float image = 0.;
    float radius = hash21(iv + 4.0) * hash21(iv + 24.0);
    image = circle(gv, r, 2.0 * radius);
    vec2 k = (r - gv) * 25.;
    float sparkle = 16. * pow(radius, 4.0) * 1. / dot(k, k);
    float t = .7 * hash21(iv);
    image = image * sparkle * t * (0.5 + 0.5 * sin(time + ${Math.TAU} * hash21(iv + 2.0)));
    return image;
}

void main(){
	vec2 uv = uvPass;
    vec3 color = vec3(0.0, 0.0, 0.0);

    for(int i = 0; i <= ITERATIONS; i++){
        float z = 1.0 - float(i) / float(ITERATIONS);
        uv = uv * rotate(1.34) * 2.0 + vec2(10.0, 13.0);

        vec3 mixed = mix(vec3(1.0, 0.7, 0.6), vec3(0.4, 0.8, 1.0), z);
        color += mixed * layer(uv);
    }
    vec3 cloudsColor = vec3(0.0);
    float clouds = max(0.0, fbm(0.16 * uv + vec2(0.03 * time, 0.0)) - 0.5);
    cloudsColor += mix(vec3(0.0), 28.0 * vec3(0.15, 0.15, 0.15), clouds);
    clouds = max(0.0, fbm(0.18 * uv + vec2(0.07 * time, 256.0)) - 0.5);
    cloudsColor += mix(vec3(0.0), 28.0 * vec3(0.05, 0.16, 0.18), clouds);

    color += 0.25 * pow(cloudsColor, vec3(2.0)) + pow(2.0 * cloudsColor * color, vec3(2.0));

	gl_FragColor = vec4(pow(color, vec3(1.0)), 1.0);
}`
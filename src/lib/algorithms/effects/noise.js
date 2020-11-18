export const fractionalBrownianMotion = ({
    type = 'float',
    octaves = 5
}) => `
float fbm(${type} x){
    float value = 0.0;
    float amplitude = 0.5;
    ${type} shift = ${type}(100);
    mat2 rotate = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5)); //TODO only for 2D
    for(int i = 0; i < ${octaves}; i++){
        value += amplitude * noise(x);
        x *= 2.0;
        x = rotate * x; //TODO only for 2D
        x += shift;
        amplitude *= 0.5;
    }
    return value;
}`

export const fbm = ({ octaves }) => `
const int OCTAVES = ${octaves};
float fbm(in vec2 p) {
	float s = .0;
	float m = .0;
	float a = .5;
	for(int i = 0; i < OCTAVES; i++){
		s += a * noise(p);
		m += a;
		a *= .5;
		p *= 2.;
	}
	return s / m;
}`

export const simpleNoise = `
float hash(float seed){ return fract(sin(seed) * 71523.5413291); } //43758.5453123
float hash(vec2 seed){ return hash(dot(seed, vec2(13.4251, 15.5128))); }

float noise(float p){
	float fl = floor(p);
  float fc = fract(p);
	return mix(hash(fl), hash(fl + 1.0), fc);
}
	
float noise(vec2 n){
	const vec2 d = vec2(0.0, 1.0);
  vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
	return mix(mix(hash(b), hash(b + d.yx), f.x), mix(hash(b + d.xy), hash(b + d.yy), f.x), f.y);
}`

export const fastNoise = `
float hash(vec2 n){
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p){
	vec2 ip = floor(p);
	vec2 u = fract(p);
	u = u*u*(3.0-2.0*u);
	
	float res = mix(
		mix(hash(ip),hash(ip+vec2(1.0,0.0)),u.x),
		mix(hash(ip+vec2(0.0,1.0)),hash(ip+vec2(1.0,1.0)),u.x),u.y);
	return res*res;
}`

export const hashNoise = `
vec2 hash(in vec2 seed){
    const vec2 scale = vec2(0.3183099, 0.3678794);
    seed = seed * scale + scale.yx;
    return -1.0 + 2.0 * fract(16.0 * scale * fract(seed.x * seed.y * (seed.x + seed.y)));
}
float noise(in vec2 seed){
    vec2 i = floor(seed);
    vec2 f = fract(seed);
    vec2 u = f*f*(3.0-2.0*f);
    return 0.5 + mix(mix(
        dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
        dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)),
    u.x), mix(
        dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
        dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)),
    u.x), u.y);
}`

export const seamlessNoise = `
float snoise(vec3 uv, float res){
	const vec3 s = vec3(1e0, 1e2, 1e3);
	
	uv *= res;
	
	vec3 uv0 = floor(mod(uv, res))*s;
	vec3 uv1 = floor(mod(uv+vec3(1.), res))*s;
	
	vec3 f = fract(uv); f = f*f*(3.0-2.0*f);

	vec4 v = vec4(uv0.x+uv0.y+uv0.z, uv1.x+uv0.y+uv0.z,
		      	  uv0.x+uv1.y+uv0.z, uv1.x+uv1.y+uv0.z);

	vec4 r = fract(sin(v*1e-1)*1e3);
	float r0 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);
	
	r = fract(sin((v + uv1.z - uv0.z)*1e-1)*1e3);
	float r1 = mix(mix(r.x, r.y, f.x), mix(r.z, r.w, f.x), f.y);
	
	return mix(r0, r1, f.z)*2.-1.;
}

float octaveNoise(in vec3 coord){
    float value = 0.0;
    for(int i = 0; i <= 6; i++){
        float power = pow(2.0, float(i));
        value += (1.5 / power) * snoise(coord, power * 16.0);
    }
    return value;
}`
const noise = `
vec2 hash(vec2 p){
	p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
	return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

float noise(in vec2 p){
    const float K1 = ${0.5 * (Math.sqrt(3) - 1)};
    const float K2 = ${0.5 - Math.sqrt(3) / 6};
	vec2 i = floor(p + (p.x+p.y)*K1);	
    vec2 a = p - i + (i.x+i.y)*K2;
    vec2 o = vec2(1.0-step(a.x, a.y), step(a.x, a.y));
    vec2 b = a - o + K2;
	vec2 c = a - 1.0 + 2.0*K2;
    vec3 h = max(0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );
	vec3 n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
    return dot(n, vec3(70.0));	
}`

export const glareFilter = {
    frag: `
varying vec2 uvPass;
uniform sampler2D sampler;
uniform vec2 invResolution;

uniform float time;
uniform vec3 seaColor;

${noise}

const int ITERATIONS = 4;
const mat2 m = mat2(1.6,  1.2, -1.2,  1.6);

void main(){
    vec4 color = texture2D(sampler, uvPass);
    vec2 offset = time * 0.1 * vec2(1.0, 0.0);
	vec2 uv = 3.6 * uvPass;

    float total = 0.0;
    float amplitude = 0.1;
    for(int i = 0; i < ITERATIONS; i++){
        total += amplitude * noise(uv);
        uv = m * uv - offset;
        amplitude *= 0.4;
    }
    float displacement = 1.6 * total;

    uv = 8.0 * uvPass;
    total = 0.0;
    amplitude = 0.4;
    uv -= displacement - offset;
    for(int i = 0; i < ITERATIONS; i++){
        total += abs(amplitude * noise(uv));
        uv = m * uv + offset;
        amplitude *= 0.6;
    }
    float height = pow(1.0 - total, 4.0);

    gl_FragColor = color * vec4(height * seaColor, height);
}`
}
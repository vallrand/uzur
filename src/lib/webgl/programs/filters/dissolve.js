export const dissolveFilter = {
    frag: `
varying vec2 uvPass;
uniform sampler2D sampler;
uniform vec2 invResolution;

uniform vec3 edgeColor;
        
const float minThreshold = 0.003;
        
float diffuse(float color, float left, float right, float down, float up){
    float factor = 0.1 * 14.0 * 0.016 * (left + right + down + up - 4.0 * color);
    if(factor >= -minThreshold && factor < 0.0) factor = -minThreshold;
    return color + factor;
}

void main(){
    vec4 color = texture2D(sampler, uvPass);
    vec4 rightColor = texture2D(sampler, vec2(uvPass.x + 2.0 * invResolution.x, uvPass.y));
    vec4 leftColor = texture2D(sampler, vec2(uvPass.x - 2.0 * invResolution.x, uvPass.y));
    vec4 upColor = texture2D(sampler, vec2(uvPass.x, uvPass.y + 2.0 * invResolution.y));
    vec4 downColor = texture2D(sampler, vec2(uvPass.x, uvPass.y - 2.0 * invResolution.y));

    gl_FragColor = color;

    gl_FragColor.r = diffuse(gl_FragColor.r, rightColor.r, leftColor.r, downColor.r, upColor.r);
    gl_FragColor.g = diffuse(gl_FragColor.g, rightColor.g, leftColor.g, downColor.g, upColor.g);
    gl_FragColor.b = diffuse(gl_FragColor.b, rightColor.b, leftColor.b, downColor.b, upColor.b);

    float alpha = min(color.a, min(rightColor.a, min(leftColor.a, min(upColor.a, downColor.a))));
    if(alpha <= 0.8){ gl_FragColor.rgb = mix(gl_FragColor.rgb, edgeColor, 0.1); }
    if(alpha <= 0.5){ gl_FragColor.a -= 0.075; }
}`
}
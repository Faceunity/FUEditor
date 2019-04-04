
float unpack(vec4 color)
{
    const vec4 bitShifts = 255.0 / 256.0 * vec4(1.0 / (256.0 * 256.0 * 256.0),
                                                1.0 / (256.0 * 256.0),
                                                1.0 / 256.0,
                                                1.0);
    return dot(color, bitShifts);
}

vec4 pack(float depth)
{
    const vec4 bitSh = vec4(256.0 * 256.0 * 256.0,
                            256.0 * 256.0,
                            256.0,
                            1.0);
    const vec4 bitMsk = vec4(0,
                             1.0 / 256.0,
                             1.0 / 256.0,
                             1.0 / 256.0);
    vec4 comp = fract(depth * bitSh);
    comp -= comp.xxyz * bitMsk;
    return comp * (256.0 / 255.0);
}


// required when using a perspective projection matrix
float LinearizeDepth(float depth)
{
    float z = depth * 2.0 - 1.0;// Back to NDC
    return (2.0 * FARPLANE * NEARPLANE) / (FARPLANE + NEARPLANE - z * (FARPLANE - NEARPLANE));  
}


vec4 shader_main() {
    vec4 packedDepth = texture2D(tex_color, st);
    float depth = unpack(packedDepth);

    return vec4(vec3(depth), 1.0);
    //float depth = texture2D(tex_color, st).z;
    //return vec4(vec3(LinearizeDepth(depth) / FARPLANE), 1.0);
    //return texture2D(tex_color, st);
}
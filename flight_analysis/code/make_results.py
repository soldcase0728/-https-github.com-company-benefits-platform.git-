import json, numpy as np
S = json.load(open('../mc_summary.json')); R = S['results']; E = json.load(open('../eyewitness_test.json'))
T = json.load(open('../tornado.json')); tr = json.load(open('../ball_track.json'))
def q(k, nd=1): r = R[k]; return dict(median=round(r['median'], nd), p10=round(r['p10'], nd), p90=round(r['p90'], nd), p5=round(r['p5'], nd), p95=round(r['p95'], nd))
inputs = {
 'video': dict(value='1280x720 H.264, VFR (~30 fps live, 14 gaps of 66-67 ms), live from 4.000 s', tag='MEASURED', source='ffprobe per-frame PTS (frame_pts.csv)'),
 't_contact_visual_s': dict(value=5.000, sigma=0.033, tag='MEASURED', source='bat in zone i140 (4.967)-i141 (5.000), follow-through i142 (5.034)'),
 't_bat_crack_audio_s': dict(value=5.086, sigma=0.002, tag='MEASURED', source='high-pass onset; used only as cross-check'),
 'ball_track': dict(value=f'{len(tr)} detections, {tr[0]["t"]:.3f}-{tr[-1]["t"]:.3f} s', sigma='0.5-1.0 px (+0.7 px MC noise)', tag='MEASURED', source='temporal-median residual, sub-px centroid; i175-176 excluded (encoder-copied)'),
 'aerial_scale_px_per_ft': dict(value=[2.616, 2.686], tag='MEASURED/USER-SUPPLIED', source='infield (4 landmarks, sd 0.5%) vs user 250-ft yellow line; disagree 2.7% -> sampled uniformly'),
 'fence_distance_at_landing_azimuth_ft': dict(**q('D_fence'), tag='MEASURED', source='aerial fence polyline D(phi)'),
 'camera_behind_apex_ft': dict(value=27.3, sigma=1.0, tag='MEASURED', source='aerial backstop netting on CF line'),
 'camera_height_ft': dict(prior=5.0, sigma=0.5, fitted=q('hc', 2), tag='USER-SUPPLIED prior; fitted', source='user "about 60 in"'),
 'light_poles': dict(value='LC base aerial (755,340), RC base (360,735)', sigma='4 px aerial', tag='MEASURED', source='shadow convergence; matched to video poles u=342, 1019'),
 'fence_height_ft': dict(value='U(4,8)', tag='ASSUMED', source='prior; not measurable (ball arrived rolling)'),
 'air_density_kg_m3': dict(value=1.221, sigma=0.012, tag='MEASURED (reanalysis)', source='Open-Meteo archive, Grand Park 2026-10-03 08:30 EDT: 9.2 C, RH 92%, 993.8 hPa, elev 268 m'),
 'wind_10m': dict(value='2.7 m/s from 52 deg (NE)', tag='MEASURED (reanalysis)', source='Open-Meteo; at ball height sampled N(2.0,1.0) m/s from N(52,25) deg -> mostly crosswind toward RF'),
 'C_D': dict(value='U(0.28,0.40)', nominal=0.33, tag='ASSUMED', source='Kensrud & Smith 2010 range'),
 'backspin_rpm': dict(value='U(500,2500)', nominal=1500, tag='ASSUMED', source='batted-softball spin poorly documented; dominant uncertainty'),
 'C_L(S)': dict(value='1.5S (S<=0.1), 0.09+0.6S', tag='ASSUMED', source='baseball-derived (Nathan 2008)'),
 'ball': dict(value='12.0 in, 0.184 kg', tag='ASSUMED', source='legal ranges; effect folded into C_D range'),
 'contact_point_ft': dict(value='X 2.0+-0.75, Y 0.3+-0.7, Z 2.5+-0.5 (fit priors)', fitted=dict(x=q('cx', 2), y=q('cy', 2), z=q('cz', 2)), tag='ASSUMED prior'),
 'eyewitness_roll_s': dict(value=0.4, tag='USER-SUPPLIED', source='tested, NOT used in the main result: inconsistent with video (see consistency_tests)'),
}
outputs = {
 'fly_or_bounce': 'BOUNCE: landed in right-center and bounced/rolled to the fence (P(fly to fence)=0.000 in 5000 MC draws)',
 'spray_angle_deg_right_of_center': q('phi'), 'landing_azimuth_deg': q('land_phi'),
 'exit_velocity_mph': q('ev'), 'launch_angle_deg': q('la'),
 't_contact_fit_s': q('tc', 3), 'hang_time_to_landing_s': q('hang', 2), 't_landing_pts_s': q('t_land', 2),
 'projected_carry_no_fence_ft': q('carry'), 'bounce_roll_distance_to_fence_ft': q('roll_ft'),
 'apex_height_ft': q('apex_z'), 'apex_distance_ft': q('apex_r'), 'apex_time_after_contact_s': q('apex_t_after_contact', 2),
 'landing_speed_mph': q('v_land_mph'), 'landing_horizontal_speed_fps': q('vx_land_fps'), 'descent_angle_deg': q('descent_deg'),
 'height_at_distance_ft': S['height_at_distance_ft'], 'p_cleared_fence_4to8ft_at': S['p_cleared_fence_if_at'],
 'fence_arrival_time': 'NOT MEASURED (outfield patch occluded by infielders; no carom; audio masked by cheering)',
 'impact_height_on_fence': 'NOT MEASURED; ball arrived bouncing/rolling, so near ground level',
 'camera_fit': dict(f_px=q('f'), height_ft=q('hc', 2), x_ft=q('Xc', 2), y_ft=q('Yc', 2), pitch_deg=q('pitch', 2), roll_deg=q('roll', 2),
                    yaw_deg=q('yaw', 2), k1=q('k1', 3), pole_heights_ft=dict(LC=q('Hl'), RC=q('Hr'))),
}
out = dict(inputs=inputs, outputs=outputs,
           monte_carlo=dict(n=S['n_samples'], accepted=S['n_accepted'], rejection_rate=S['rejection_rate'], reject_rule=S['reject_rule'], seed=20261003,
                            spearman_sensitivity=S['spearman_sensitivity']),
           consistency_tests=dict(eyewitness_landing_D_minus_20ft=E, tornado_one_at_a_time=T),
           public_use=dict(measured_facts=['Ball hit to right-center, ~12-14 deg right of straightaway center', 'Fence there is ~250-255 ft (aerial)', 'Ball stayed in the park; batter reached third'],
                           carry_10th_pct_rounded_down_ft=int(5*np.floor(R['carry']['p10']/5))))
json.dump(out, open('../results.json', 'w'), indent=1); print('carry p10 rounded down', out['public_use']['carry_10th_pct_rounded_down_ft'])

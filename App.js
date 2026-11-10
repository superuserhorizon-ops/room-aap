import React, { useState, useEffect, useMemo, useContext } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Modal, BackHandler, Alert, StyleSheet, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

const FLOW = { team: ['To do', 'Doing', 'Review', 'Done'], home: ['To do', 'Done'] };
const ACC = [['Indigo', '#4f46e5', '#8b93ff'], ['Emerald', '#0b8f63', '#3ddc97'], ['Coral', '#e5532d', '#ff8a65'], ['Rose', '#d6336c', '#ff7aa8'], ['Ocean', '#0a7fc4', '#58b8ff'], ['Violet', '#7c3aed', '#b79cff']];
const SC = { 'To do': '#8a96a0', Doing: '#e08a00', Review: '#8a4fff', Done: '#12915a' };
const LATE = '#d6362f';
const day = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5);
const isLate = (t) => t.due < day() && t.s !== 'Done';
const dueTxt = (d) => { const x = d - day(); return x < 0 ? `${-x}d late` : x === 0 ? 'Today' : x === 1 ? 'Tomorrow' : `In ${x}d`; };
const INIT = { me: '', rooms: [], nid: 1, pro: false, mode: 'auto', ai: 0 };
const X = React.createContext();
const useX = () => useContext(X);

const mk = (T) => StyleSheet.create({
  card: { backgroundColor: T.card, borderRadius: 20, padding: 16, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  btn: { backgroundColor: T.acc, borderRadius: 16, padding: 15, alignItems: 'center' },
  btnT: { color: T.ai, fontWeight: '800', fontSize: 16 },
  alt: { backgroundColor: T.card, borderWidth: 1.5, borderColor: T.line },
  altT: { color: T.ink },
  inp: { backgroundColor: T.card, color: T.ink, borderWidth: 1.5, borderColor: T.line, borderRadius: 14, padding: 14, fontSize: 16, marginTop: 6, marginBottom: 14 },
  lab: { color: T.mute, fontWeight: '600', fontSize: 13 },
  mute: { color: T.mute, fontSize: 13 },
  ink: { color: T.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  h1: { color: T.ink, fontSize: 24, fontWeight: '800', flex: 1 },
  av: { width: 36, height: 36, borderRadius: 18, backgroundColor: T.acc + '28', alignItems: 'center', justifyContent: 'center' },
  avT: { color: T.acc, fontWeight: '800' },
  bar: { height: 12, borderRadius: 8, backgroundColor: T.line, overflow: 'hidden', flexDirection: 'row', marginVertical: 8 },
});

function Btn({ t, on, alt, small }) {
  const { s } = useX();
  return (<Pressable onPress={on} style={[s.btn, alt && s.alt, small && { paddingVertical: 10, paddingHorizontal: 16 }]}><Text style={[s.btnT, alt && s.altT, small && { fontSize: 14 }]}>{t}</Text></Pressable>);
}
function Av({ n }) { const { s } = useX(); return <View style={s.av}><Text style={s.avT}>{(n || '?')[0].toUpperCase()}</Text></View>; }
function Pick({ opts, val, on, lock }) {
  const { T } = useX();
  return (<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6, marginBottom: 14 }}>
    {opts.map((o, i) => (<Pressable key={i} onPress={() => on(o[1], o[2])} style={{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1.5, borderColor: val === o[1] ? T.acc : T.line, backgroundColor: val === o[1] ? T.acc + '22' : T.card, opacity: lock && o[2] ? 0.6 : 1 }}>
      <Text style={{ color: val === o[1] ? T.acc : T.ink, fontWeight: '700' }}>{o[0]}{lock && o[2] ? ' (Pro)' : ''}</Text></Pressable>))}
  </View>);
}
function Head({ title, back, right }) {
  const { s, T, setScr } = useX();
  return (<View style={[s.row, { padding: 16, paddingBottom: 8 }]}>
    {back && <Pressable onPress={() => setScr('home')}><Text style={{ color: T.ink, fontSize: 26, paddingRight: 6 }}>‹</Text></Pressable>}
    <Text style={s.h1} numberOfLines={1}>{title}</Text>{right}</View>);
}

function Welcome() {
  const { s, T, up, setScr, say } = useX(); const [n, setN] = useState(''); const ins = useSafeAreaInsets();
  return (<ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
    <View style={{ backgroundColor: T.acc, padding: 26, paddingTop: ins.top + 44, paddingBottom: 84, borderBottomLeftRadius: 36, borderBottomRightRadius: 36, overflow: 'hidden' }}>
      <View style={{ position: 'absolute', right: -60, top: -50, width: 220, height: 220, borderRadius: 110, backgroundColor: '#ffffff24' }} />
      <View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: '#ffffff38', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: T.ai, fontSize: 26, fontWeight: '800' }}>✓</Text></View>
      <Text style={{ color: T.ai, fontSize: 34, fontWeight: '800', marginTop: 20, lineHeight: 38 }}>Run your team from one simple room.</Text>
      <Text style={{ color: T.ai, opacity: 0.9, marginTop: 12, fontSize: 15, lineHeight: 22 }}>Create a room, assign tasks and see who is done or late. No sign-up needed.</Text>
    </View>
    <View style={[s.card, { marginHorizontal: 20, marginTop: -50 }]}><View style={s.row}><Av n="A" /><View style={{ flex: 1 }}><Text style={[s.ink, { fontWeight: '800' }]}>Edit vlog 43</Text><Text style={s.mute}>Ali · Tomorrow</Text></View>
      <View style={{ backgroundColor: SC.Doing, borderRadius: 12, paddingVertical: 7, paddingHorizontal: 12 }}><Text style={{ fontWeight: '800', color: '#101614' }}>Doing</Text></View></View></View>
    <View style={{ padding: 20 }}><Text style={s.lab}>What should we call you?</Text>
      <TextInput style={s.inp} value={n} onChangeText={setN} placeholder="e.g. Ahmed" placeholderTextColor={T.mute} />
      <Btn t="Get started" on={() => { if (!n.trim()) return say('Enter your name first'); up((d) => { d.me = n.trim(); }); setScr('home'); }} />
      <Text style={[s.mute, { textAlign: 'center', marginTop: 12 }]}>Free for up to 3 rooms. Data stays on this phone.</Text></View>
  </ScrollView>);
}

function Home() {
  const { s, T, D, setScr, setRid, setTab } = useX();
  return (<View style={{ flex: 1 }}>
    <Head title={`Hi, ${D.me}`} right={<Pressable onPress={() => setScr('settings')}><Text style={{ color: T.ink, fontSize: 24 }}>⚙</Text></Pressable>} />
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {!D.rooms.length && <View style={s.card}><Text style={[s.ink, { fontWeight: '800', fontSize: 16 }]}>No rooms yet</Text><Text style={[s.mute, { marginTop: 4 }]}>Create your first room, for example "YouTube channel" or "Home".</Text></View>}
      {D.rooms.map((r) => { const open = r.tasks.filter((t) => t.s !== 'Done').length, late = r.tasks.filter(isLate).length;
        return (<Pressable key={r.id} style={s.card} onPress={() => { setRid(r.id); setTab('tasks'); setScr('room'); }}><View style={s.row}><Av n={r.name} /><View style={{ flex: 1 }}>
          <Text style={[s.ink, { fontWeight: '800' }]}>{r.name}</Text><Text style={s.mute}>{r.members.length} members · {open} open{late ? <Text style={{ color: LATE, fontWeight: '800' }}> · {late} late</Text> : null}</Text></View><Text style={s.mute}>›</Text></View></Pressable>); })}
    </ScrollView>
    <View style={[s.row, { padding: 16, borderTopWidth: 1, borderTopColor: T.line }]}><View style={{ flex: 1 }}><Btn t="Create room" on={() => setScr('create')} /></View><View style={{ flex: 1 }}><Btn alt t="Join room" on={() => setScr('join')} /></View></View>
  </View>);
}

function Create() {
  const { s, D, up, setScr, setRid, setTab, setSheet, say } = useX(); const [n, setN] = useState(''); const [ty, setTy] = useState('team');
  const go = () => {
    if (!n.trim()) return say('Give the room a name');
    if (D.rooms.filter((r) => r.members[0] === D.me).length >= 3 && !D.pro) return setSheet('pay');
    const id = D.nid; up((d) => { d.rooms.push({ id, name: n.trim(), type: ty, code: Math.random().toString(36).slice(2, 8).toUpperCase(), members: [d.me], tasks: [] }); d.nid++; });
    setRid(id); setTab('tasks'); setScr('room');
  };
  return (<View style={{ flex: 1 }}><Head title="Create room" back /><ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
    <Text style={s.lab}>Room name</Text><TextInput style={s.inp} value={n} onChangeText={setN} placeholder="e.g. Marketing team" placeholderTextColor="#8888" />
    <Text style={s.lab}>Room type</Text><Pick val={ty} on={setTy} opts={[['Team: To do, Doing, Review, Done', 'team'], ['Home: To do, Done', 'home']]} />
    <Btn t="Create room" on={go} /><Text style={[s.mute, { textAlign: 'center', marginTop: 12 }]}>Free: up to 3 rooms you own, 5 members each.</Text></ScrollView></View>);
}

function Join() {
  const { s, D, up, setScr, setRid, setTab, say } = useX(); const [c, setC] = useState('');
  const go = () => {
    if (c.trim().length < 4) return say('Enter the room code');
    const id = D.nid, code = c.trim().toUpperCase();
    up((d) => { d.rooms.push({ id, name: `Room ${code}`, type: 'team', code, members: ['Admin', d.me], tasks: [] }); d.nid++; });
    setRid(id); setTab('tasks'); setScr('room'); say('Local copy created. Real joining needs a server.');
  };
  return (<View style={{ flex: 1 }}><Head title="Join room" back /><View style={{ padding: 16 }}>
    <Text style={s.lab}>Room code</Text><TextInput style={s.inp} value={c} onChangeText={setC} autoCapitalize="characters" maxLength={8} placeholder="e.g. YT4821" placeholderTextColor="#8888" />
    <Btn t="Join room" on={go} /><Text style={[s.mute, { textAlign: 'center', marginTop: 12 }]}>This version has no server, so joining only makes a local room on this phone.</Text></View></View>);
}

function Room() {
  const { s, T, room, tab, setTab, setSheet } = useX();
  if (!room) return null;
  return (<View style={{ flex: 1 }}><Head title={room.name} back />
    <View style={[s.row, { marginHorizontal: 16, padding: 4, backgroundColor: T.acc + '18', borderRadius: 16, gap: 4 }]}>
      {[['tasks', 'Tasks'], ['dash', room.type === 'home' ? 'Progress' : 'Dashboard'], ['members', 'Members']].map(([k, l]) => (
        <Pressable key={k} onPress={() => setTab(k)} style={{ flex: 1, padding: 10, borderRadius: 12, alignItems: 'center', backgroundColor: tab === k ? T.card : 'transparent' }}><Text style={{ fontWeight: '800', color: tab === k ? T.acc : T.mute }}>{l}</Text></Pressable>))}</View>
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110 }}>{tab === 'tasks' ? <Tasks /> : tab === 'dash' ? <Dash /> : <Members />}</ScrollView>
    {tab === 'tasks' && <Pressable onPress={() => setSheet('task')} style={{ position: 'absolute', right: 16, bottom: 24, backgroundColor: T.acc, borderRadius: 30, paddingVertical: 15, paddingHorizontal: 22, elevation: 6 }}><Text style={s.btnT}>+ Add task</Text></Pressable>}
  </View>);
}

function Tasks() {
  const { s, room, up, rid } = useX();
  const adv = (id) => up((d) => {
    const r = d.rooms.find((x) => x.id === rid), t = r.tasks.find((x) => x.id === id), f = FLOW[r.type]; t.s = f[(f.indexOf(t.s) + 1) % f.length];
    if (t.s === 'Done') { t.doneAt = day(); if (t.rep) { r.tasks.unshift({ id: d.nid++, t: t.t, a: t.a, due: t.due + t.rep, s: 'To do', rep: t.rep }); t.rep = 0; } } else delete t.doneAt;
  });
  if (!room.tasks.length) return <View style={s.card}><Text style={[s.ink, { fontWeight: '800' }]}>No tasks yet</Text><Text style={s.mute}>Tap "Add task" to assign the first one.</Text></View>;
  return FLOW[room.type].map((st) => { const ts = room.tasks.filter((t) => t.s === st); if (!ts.length) return null;
    return (<View key={st}><Text style={[s.mute, { fontWeight: '800', marginVertical: 8 }]}>{st} · {ts.length}</Text>
      {ts.map((t) => (<View key={t.id} style={s.card}><View style={s.row}><Av n={t.a} /><View style={{ flex: 1 }}><Text style={[s.ink, { fontWeight: '800' }]}>{t.t}</Text>
        <Text style={s.mute}>{t.a} · <Text style={isLate(t) ? { color: LATE, fontWeight: '800' } : null}>{dueTxt(t.due)}</Text>{t.rep ? ' · repeats' : ''}</Text></View>
        <Pressable onPress={() => adv(t.id)} style={{ backgroundColor: SC[t.s], borderRadius: 12, paddingVertical: 9, paddingHorizontal: 13 }}><Text style={{ fontWeight: '800', color: t.s === 'Review' || t.s === 'Done' ? '#fff' : '#101614' }}>{t.s} ›</Text></Pressable></View></View>))}</View>); });
}

function Dash() {
  const { s, T, room, D, setSheet } = useX();
  const done = room.tasks.filter((t) => t.s === 'Done').length, tot = room.tasks.length || 1, now = day();
  const rows = room.members.map((m) => { const my = room.tasks.filter((t) => t.a === m); return { m, d: my.filter((t) => t.s === 'Done').length, l: my.filter(isLate).length, o: my.filter((t) => t.s !== 'Done' && !isLate(t)).length }; });
  const wk = [3, 2, 1, 0].map((w) => room.tasks.filter((t) => t.doneAt != null && t.doneAt > now - 7 * (w + 1) && t.doneAt <= now - 7 * w).length);
  const dn = room.tasks.filter((t) => t.doneAt != null), ontime = dn.length ? Math.round(dn.filter((t) => t.doneAt <= t.due).length / dn.length * 100) : 0;
  const seg = (w, c) => <View style={{ width: `${w}%`, backgroundColor: c }} />;
  return (<View>
    <View style={s.card}><Text style={[s.ink, { fontWeight: '800' }]}>This room</Text><Text style={[s.ink, { fontSize: 30, fontWeight: '800' }]}>{Math.round(done / tot * 100)}% done</Text>
      <View style={s.bar}>{seg(done / tot * 100, SC.Done)}</View><Text style={s.mute}>{done} of {room.tasks.length} tasks finished</Text></View>
    {room.type === 'home' ? rows.map((x) => <View key={x.m} style={[s.card, s.row]}><Av n={x.m} /><Text style={[s.ink, { flex: 1, fontWeight: '800' }]}>{x.m}</Text><Text style={s.mute}>{x.d} done · {x.o + x.l} pending</Text></View>)
      : rows.map((x) => { const n = x.d + x.l + x.o || 1; return (<View key={x.m} style={s.card}><View style={s.row}><Av n={x.m} /><Text style={[s.ink, { fontWeight: '800' }]}>{x.m}</Text></View>
        <View style={s.bar}>{seg(x.d / n * 100, SC.Done)}{seg(x.o / n * 100, SC['To do'])}{seg(x.l / n * 100, LATE)}</View>
        <Text style={s.mute}>{x.d} done · {x.o} open · <Text style={x.l ? { color: LATE, fontWeight: '800' } : null}>{x.l} overdue</Text></Text></View>); })}
    {D.pro ? (<View><View style={s.card}><Text style={[s.ink, { fontWeight: '800' }]}>Finished per week (last 4 weeks)</Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 110, marginTop: 12 }}>{wk.map((v, i) => (<View key={i} style={{ flex: 1, alignItems: 'center' }}><Text style={s.mute}>{v}</Text><View style={{ width: '60%', height: 8 + v * 14, backgroundColor: T.acc, borderTopLeftRadius: 8, borderTopRightRadius: 8 }} /><Text style={s.mute}>W{i + 1}</Text></View>))}</View></View>
      <View style={s.card}><Text style={[s.ink, { fontWeight: '800' }]}>Finished on time</Text><Text style={[s.ink, { fontSize: 30, fontWeight: '800' }]}>{ontime}%</Text><Text style={s.mute}>{dn.length} finished tasks counted</Text></View></View>)
      : (<Pressable style={[s.card, { opacity: 0.75 }]} onPress={() => setSheet('pay')}><Text style={[s.ink, { fontWeight: '800' }]}>History and on-time rate (Pro)</Text><Text style={s.mute}>See weekly trends and how many tasks finish on time.</Text></Pressable>)}
  </View>);
}

function Members() {
  const { s, T, room, D, up, rid, setSheet, say } = useX(); const [n, setN] = useState('');
  const add = () => { if (!n.trim()) return; if (room.members.length >= (D.pro ? 15 : 5)) return setSheet('pay');
    up((d) => { d.rooms.find((x) => x.id === rid).members.push(n.trim()); }); setN(''); say('Member added'); };
  return (<View>
    <View style={[s.card, { alignItems: 'center' }]}><Text style={s.mute}>Room code</Text><Text style={{ color: T.ink, fontSize: 34, fontWeight: '800', letterSpacing: 6, marginVertical: 6 }}>{room.code}</Text></View>
    {room.members.map((m, i) => <View key={i} style={[s.card, s.row]}><Av n={m} /><Text style={[s.ink, { flex: 1, fontWeight: '800' }]}>{m}{m === D.me ? ' (you)' : ''}</Text><Text style={s.mute}>{i === 0 ? 'Admin' : 'Member'}</Text></View>)}
    <Text style={s.lab}>Add a member by name</Text><View style={s.row}><TextInput style={[s.inp, { flex: 1, marginBottom: 0 }]} value={n} onChangeText={setN} placeholder="Name" placeholderTextColor="#8888" /><Btn small t="Add" on={add} /></View>
    <Text style={[s.mute, { textAlign: 'center', marginTop: 12 }]}>{room.members.length} of {D.pro ? 15 : 5} members.</Text></View>);
}

function TaskSheet() {
  const { s, T, room, D, up, rid, setSheet, say } = useX(); const [t, setT] = useState(''); const [a, setA] = useState(room.members[0]); const [off, setOff] = useState(1); const [rep, setRep] = useState(0);
  const save = () => { if (!t.trim()) return say('Write a task title');
    up((d) => { const r = d.rooms.find((x) => x.id === rid); r.tasks.unshift({ id: d.nid++, t: t.trim(), a, due: day() + off, s: 'To do', rep }); }); setSheet(null); say('Task assigned'); };
  return (<ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 18 }}>
    <Text style={[s.h1, { marginBottom: 12 }]}>New task</Text>
    <Text style={s.lab}>What needs to be done?</Text><TextInput style={s.inp} value={t} onChangeText={setT} placeholder="e.g. Edit vlog 43" placeholderTextColor="#8888" autoFocus />
    <Text style={s.lab}>Assign to</Text><Pick val={a} on={setA} opts={room.members.map((m) => [m, m])} />
    <Text style={s.lab}>Due</Text><Pick val={off} on={setOff} opts={[['Today', 0], ['Tomorrow', 1], ['In 3 days', 3], ['Next week', 7]]} />
    <Text style={s.lab}>Repeat</Text><Pick val={rep} lock={!D.pro} on={(v, locked) => (locked && !D.pro ? setSheet('pay') : setRep(v))} opts={[['Never', 0], ['Daily', 1, 1], ['Weekly', 7, 1], ['Monthly', 30, 1]]} />
    <Btn t="Assign task" on={save} /></ScrollView>);
}

function PaySheet() {
  const { s, T, up, setSheet, say } = useX();
  const R = [['Rooms you own', '3', 'Unlimited'], ['Members per room', '5', '15'], ['Tasks and statuses', '✓', '✓'], ['Recurring tasks', '–', '✓'], ['History and on-time rate', '–', '✓']];
  return (<View style={{ padding: 18 }}><Text style={s.h1}>Upgrade to Pro</Text><Text style={[s.mute, { marginVertical: 8 }]}>Only the room admin pays. Members are always free.</Text>
    {R.map((r) => <View key={r[0]} style={[s.row, { paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: T.line }]}><Text style={[s.ink, { flex: 2 }]}>{r[0]}</Text><Text style={[s.mute, { flex: 1 }]}>{r[1]}</Text><Text style={[s.ink, { flex: 1, fontWeight: '800' }]}>{r[2]}</Text></View>)}
    <Text style={[s.ink, { marginVertical: 14 }]}><Text style={{ fontWeight: '800' }}>$4.99/month</Text> or <Text style={{ fontWeight: '800' }}>$39.99/year</Text> (suggested price)</Text>
    <Btn t="Try Pro (demo, no payment)" on={() => { up((d) => { d.pro = true; }); setSheet(null); say('Pro is on (demo)'); }} /><View style={{ height: 8 }} /><Btn alt t="Not now" on={() => setSheet(null)} /></View>);
}

function Settings() {
  const { s, T, D, up, setScr, setSheet, dark } = useX();
  const wipe = () => Alert.alert('Delete all data?', 'Rooms and tasks on this phone will be removed.', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => { up((d) => { Object.assign(d, INIT); }); setScr('welcome'); } }]);
  return (<View style={{ flex: 1 }}><Head title="Settings" back /><ScrollView contentContainerStyle={{ padding: 16 }}>
    <View style={s.card}><Text style={[s.ink, { fontWeight: '800' }]}>Appearance</Text><View style={{ height: 10 }} />
      <Pick val={D.mode} on={(v) => up((d) => { d.mode = v; })} opts={[['Auto', 'auto'], ['Light', 'light'], ['Dark', 'dark']]} />
      <Text style={s.mute}>Accent colour</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 }}>
        {ACC.map((c, i) => (<Pressable key={c[0]} accessibilityLabel={c[0]} onPress={() => up((d) => { d.ai = i; })} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: dark ? c[2] : c[1], borderWidth: 3, borderColor: D.ai === i ? T.ink : 'transparent', alignItems: 'center', justifyContent: 'center' }}>{D.ai === i && <Text style={{ color: '#fff', fontWeight: '800' }}>✓</Text>}</Pressable>))}</View></View>
    <View style={s.card}><Text style={[s.ink, { fontWeight: '800' }]}>{D.me}</Text><Text style={[s.mute, { marginVertical: 6 }]}>Plan: {D.pro ? 'Pro (demo)' : 'Free'}. Data is stored only on this phone.</Text>
      {D.pro ? <Btn small alt t="Switch to Free" on={() => up((d) => { d.pro = false; })} /> : <Btn small t="See Pro" on={() => setSheet('pay')} />}</View>
    <View style={s.card}><Btn small alt t="Delete my data" on={wipe} /></View></ScrollView></View>);
}

function Root() {
  const sys = useColorScheme(), ins = useSafeAreaInsets();
  const [D, setD] = useState(INIT), [ready, setReady] = useState(false), [scr, setScr] = useState('home'), [rid, setRid] = useState(null), [tab, setTab] = useState('tasks'), [sheet, setSheet] = useState(null), [toast, setToast] = useState('');
  useEffect(() => { AsyncStorage.getItem('rooms-v1').then((v) => { if (v) setD({ ...INIT, ...JSON.parse(v) }); }).catch(() => {}).finally(() => setReady(true)); }, []);
  useEffect(() => { if (ready) AsyncStorage.setItem('rooms-v1', JSON.stringify(D)).catch(() => {}); }, [D, ready]);
  useEffect(() => { const h = BackHandler.addEventListener('hardwareBackPress', () => { if (sheet) { setSheet(null); return true; } if (scr !== 'home' && D.me) { setScr('home'); return true; } return false; }); return () => h.remove(); }, [scr, sheet, D.me]);
  const dark = D.mode === 'dark' || (D.mode === 'auto' && sys === 'dark'), a = ACC[D.ai] || ACC[0];
  const T = useMemo(() => ({ ...(dark ? { bg: '#0d0f1f', card: '#171a2e', ink: '#eef0ff', mute: '#a0a6c4', line: '#2a2e4a' } : { bg: '#f4f5fb', card: '#ffffff', ink: '#15172b', mute: '#5f6485', line: '#e2e4f0' }), acc: dark ? a[2] : a[1], ai: dark ? '#0d1020' : '#ffffff' }), [dark, D.ai]);
  const s = useMemo(() => mk(T), [T]);
  const up = (f) => setD((d) => { const n = JSON.parse(JSON.stringify(d)); f(n); return n; });
  const say = (m) => { setToast(m); setTimeout(() => setToast(''), 1900); };
  const room = D.rooms.find((r) => r.id === rid);
  const v = { D, T, s, up, say, scr, setScr, rid, setRid, tab, setTab, setSheet, room, dark };
  if (!ready) return <View style={{ flex: 1, backgroundColor: T.bg }} />;
  const S = !D.me ? <Welcome /> : { home: <Home />, create: <Create />, join: <Join />, room: <Room />, settings: <Settings /> }[scr];
  return (<X.Provider value={v}><View style={{ flex: 1, backgroundColor: T.bg, paddingTop: D.me ? ins.top : 0, paddingBottom: ins.bottom }}>
    <StatusBar style={dark ? 'light' : 'dark'} />{S}
    <Modal visible={!!sheet} transparent animationType="slide" onRequestClose={() => setSheet(null)}>
      <Pressable style={{ flex: 1, backgroundColor: '#0008', justifyContent: 'flex-end' }} onPress={() => setSheet(null)}>
        <Pressable style={{ backgroundColor: T.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', paddingBottom: ins.bottom }}>{sheet === 'task' && room ? <TaskSheet /> : sheet === 'pay' ? <PaySheet /> : null}</Pressable></Pressable></Modal>
    {!!toast && <View style={{ position: 'absolute', bottom: ins.bottom + 90, alignSelf: 'center', backgroundColor: T.ink, borderRadius: 24, paddingVertical: 10, paddingHorizontal: 16 }}><Text style={{ color: T.bg, fontWeight: '700' }}>{toast}</Text></View>}
  </View></X.Provider>);
}

export default function App() { return (<SafeAreaProvider><Root /></SafeAreaProvider>); }

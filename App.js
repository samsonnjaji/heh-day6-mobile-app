import React, { useMemo, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from 'react-native';
import { JOBS, MOCK_CONVERSATIONS, MOCK_PROPOSALS } from './src/data/jobs';

const categories = ['All', 'Mobile', 'Design', 'Backend', 'Marketing', 'Admin', 'Web', 'Writing', 'QA', 'Automation', 'Media', 'Support'];
const locations = ['All', 'Nairobi', 'Kisumu', 'Mombasa', 'Nakuru', 'Eldoret', 'Remote'];
const statusColors = { Pending: '#f59e0b', Viewed: '#0ea5e9', Accepted: '#16a34a', Rejected: '#dc2626' };

function currency(value) {
  return `KES ${Number(value).toLocaleString()}`;
}

function getReceipt() {
  return `NLJ${Math.floor(100000 + Math.random() * 899999)}SV`;
}

export default function App() {
  const [activeTab, setActiveTab] = useState('Home');
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [fundedJobs, setFundedJobs] = useState({});

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}> 
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
      {selectedChat ? (
        <ChatScreen conversation={selectedChat} onBack={() => setSelectedChat(null)} theme={theme} />
      ) : selectedJob ? (
        <JobDetailScreen
          job={selectedJob}
          fundedInfo={fundedJobs[selectedJob.id]}
          onBack={() => setSelectedJob(null)}
          onFunded={(jobId, receipt) => setFundedJobs((current) => ({ ...current, [jobId]: { receipt, fundedAt: new Date().toISOString() } }))}
          theme={theme}
        />
      ) : (
        <>
          {activeTab === 'Home' && <JobFeedScreen onOpenJob={setSelectedJob} theme={theme} />}
          {activeTab === 'Applications' && <ApplicationsScreen theme={theme} />}
          {activeTab === 'Messages' && <MessagesScreen onOpenChat={setSelectedChat} theme={theme} />}
          {activeTab === 'Profile' && <ProfileScreen darkMode={darkMode} setDarkMode={setDarkMode} theme={theme} />}
          <BottomTabs activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
        </>
      )}
    </SafeAreaView>
  );
}

function JobFeedScreen({ onOpenJob, theme }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftCategory, setDraftCategory] = useState('All');
  const [draftLocation, setDraftLocation] = useState('All');
  const [category, setCategory] = useState('All');
  const [location, setLocation] = useState('All');
  const [refreshSeed, setRefreshSeed] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const filteredJobs = useMemo(() => {
    const text = search.trim().toLowerCase();
    return JOBS.filter((job) => {
      const matchesSearch = !text || `${job.title} ${job.employer} ${job.skills.join(' ')}`.toLowerCase().includes(text);
      const matchesCategory = category === 'All' || job.category === category;
      const matchesLocation = location === 'All' || job.location === location;
      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [search, category, location, refreshSeed]);

  function refreshJobs() {
    setRefreshing(true);
    // The delay makes refresh behaviour visible without depending on a network API.
    setTimeout(() => {
      setRefreshSeed((value) => value + 1);
      setRefreshing(false);
    }, 1500);
  }

  function applyFilters() {
    setCategory(draftCategory);
    setLocation(draftLocation);
    setFilterOpen(false);
  }

  function resetFilters() {
    setDraftCategory('All');
    setDraftLocation('All');
    setCategory('All');
    setLocation('All');
    setFilterOpen(false);
  }

  if (loading) {
    return <SkeletonList theme={theme} />;
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}> 
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.logo, { color: theme.primary }]}>Homeland Jobs</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>Find trusted mobile work</Text>
        </View>
        <Text style={[styles.counter, { color: theme.text }]}>{filteredJobs.length} jobs</Text>
      </View>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search jobs, skills or employer"
        placeholderTextColor={theme.muted}
        style={[styles.searchInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
      />

      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.feedList}
        refreshing={refreshing}
        onRefresh={refreshJobs}
        ListEmptyComponent={<EmptyState theme={theme} />}
        renderItem={({ item }) => <JobCard job={item} onPress={() => onOpenJob(item)} theme={theme} />}
      />

      <Pressable style={[styles.fab, { backgroundColor: theme.primary }]} onPress={() => setFilterOpen(true)}>
        <Text style={styles.fabText}>Filters</Text>
      </Pressable>

      <FilterSheet
        visible={filterOpen}
        category={draftCategory}
        location={draftLocation}
        setCategory={setDraftCategory}
        setLocation={setDraftLocation}
        onApply={applyFilters}
        onReset={resetFilters}
        onClose={() => setFilterOpen(false)}
        theme={theme}
      />
    </View>
  );
}

function JobCard({ job, onPress, theme }) {
  return (
    <Pressable style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={onPress}>
      <View style={styles.cardTop}>
        <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}> 
          <Text style={[styles.avatarText, { color: theme.primary }]}>{job.employer.charAt(0)}</Text>
        </View>
        <View style={styles.cardTitleWrap}>
          <Text style={[styles.jobTitle, { color: theme.text }]}>{job.title}</Text>
          <Text style={[styles.employer, { color: theme.muted }]}>{job.employer}</Text>
        </View>
        <Text style={[styles.categoryChip, { backgroundColor: theme.chip, color: theme.primary }]}>{job.category}</Text>
      </View>
      <Text style={[styles.budget, { color: theme.text }]}>{currency(job.budget)}</Text>
      <Text style={[styles.meta, { color: theme.muted }]}>{job.location} - {job.postedDate}</Text>
      <View style={styles.tagsRow}>
        {job.skills.slice(0, 3).map((skill) => (
          <Text key={skill} style={[styles.skillTag, { backgroundColor: theme.tag, color: theme.text }]}>{skill}</Text>
        ))}
      </View>
    </Pressable>
  );
}

function JobDetailScreen({ job, fundedInfo, onBack, onFunded, theme }) {
  const [paymentOpen, setPaymentOpen] = useState(false);

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}> 
      <Pressable onPress={onBack} style={styles.backButton}><Text style={[styles.backText, { color: theme.primary }]}>Back</Text></Pressable>
      <ScrollView contentContainerStyle={styles.detailContent}>
        <Text style={[styles.detailTitle, { color: theme.text }]}>{job.title}</Text>
        <Text style={[styles.employer, { color: theme.muted }]}>{job.employer} - {job.location}</Text>
        <Text style={[styles.budgetLarge, { color: theme.primary }]}>{currency(job.budget)}</Text>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
        <Text style={[styles.bodyText, { color: theme.text }]}>{job.description}</Text>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Deadline</Text>
        <Text style={[styles.bodyText, { color: theme.text }]}>{job.deadline}</Text>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Skills</Text>
        <View style={styles.tagsRow}>{job.skills.map((skill) => <Text key={skill} style={[styles.skillTag, { backgroundColor: theme.tag, color: theme.text }]}>{skill}</Text>)}</View>

        {fundedInfo ? (
          <View style={[styles.successBox, { backgroundColor: theme.successSoft }]}> 
            <Text style={styles.successText}>Funded - Receipt {fundedInfo.receipt}</Text>
          </View>
        ) : (
          <Pressable style={[styles.primaryButton, { backgroundColor: theme.primary }]} onPress={() => setPaymentOpen(true)}>
            <Text style={styles.primaryButtonText}>Fund Escrow</Text>
          </Pressable>
        )}
      </ScrollView>
      <PaymentModal visible={paymentOpen} job={job} onClose={() => setPaymentOpen(false)} onFunded={onFunded} theme={theme} />
    </View>
  );
}

function PaymentModal({ visible, job, onClose, onFunded, theme }) {
  const [phone, setPhone] = useState('0712345678');
  const [failureMode, setFailureMode] = useState(false);
  const [state, setState] = useState('idle');
  const [receipt, setReceipt] = useState('');

  function startPayment() {
    setState('sending');
    // Two-stage simulation mirrors the UX of an STK push: request sent, then result callback.
    setTimeout(() => {
      if (failureMode) {
        setState('failed');
        return;
      }
      setState('prompt');
      setTimeout(() => {
        const nextReceipt = getReceipt();
        setReceipt(nextReceipt);
        setState('success');
        onFunded(job.id, nextReceipt);
      }, 3000);
    }, 2000);
  }

  function retry() {
    setState('idle');
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.paymentModal, { backgroundColor: theme.card }]}> 
          <Text style={[styles.detailTitle, { color: theme.text }]}>Fund Escrow</Text>
          <Text style={[styles.bodyText, { color: theme.text }]}>Amount: {currency(job.budget)}</Text>
          <Text style={[styles.label, { color: theme.text }]}>M-Pesa phone number</Text>
          <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={[styles.searchInput, { color: theme.text, borderColor: theme.border }]} />
          <View style={styles.switchRow}>
            <Text style={[styles.bodyText, { color: theme.text }]}>Simulate Failure</Text>
            <Switch value={failureMode} onValueChange={setFailureMode} />
          </View>
          {state === 'idle' && <Pressable style={[styles.primaryButton, { backgroundColor: theme.primary }]} onPress={startPayment}><Text style={styles.primaryButtonText}>Pay via M-Pesa</Text></Pressable>}
          {state === 'sending' && <View style={styles.centerBlock}><ActivityIndicator /><Text style={[styles.bodyText, { color: theme.text }]}>Sending STK Push...</Text></View>}
          {state === 'prompt' && <Text style={[styles.infoText, { color: theme.primary }]}>Check your phone - M-Pesa prompt sent</Text>}
          {state === 'success' && <View style={[styles.successBox, { backgroundColor: theme.successSoft }]}><Text style={styles.successText}>Escrow Funded Successfully</Text><Text style={styles.successText}>Receipt: {receipt}</Text></View>}
          {state === 'failed' && <View><Text style={styles.errorText}>Payment failed - insufficient funds. Try again.</Text><Pressable style={[styles.primaryButton, { backgroundColor: theme.primary }]} onPress={retry}><Text style={styles.primaryButtonText}>Retry</Text></Pressable></View>}
          <Pressable onPress={onClose} style={styles.secondaryButton}><Text style={[styles.backText, { color: theme.primary }]}>Close</Text></Pressable>
        </View>
      </View>
    </Modal>
  );
}

function FilterSheet({ visible, category, location, setCategory, setLocation, onApply, onReset, onClose, theme }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: theme.card }]}> 
        <Text style={[styles.detailTitle, { color: theme.text }]}>Filter Jobs</Text>
        <Text style={[styles.label, { color: theme.text }]}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>{categories.map((item) => <Choice key={item} label={item} active={category === item} onPress={() => setCategory(item)} theme={theme} />)}</ScrollView>
        <Text style={[styles.label, { color: theme.text }]}>Location</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>{locations.map((item) => <Choice key={item} label={item} active={location === item} onPress={() => setLocation(item)} theme={theme} />)}</ScrollView>
        <View style={styles.actionRow}>
          <Pressable style={[styles.primaryButton, { backgroundColor: theme.primary, flex: 1 }]} onPress={onApply}><Text style={styles.primaryButtonText}>Apply</Text></Pressable>
          <Pressable style={[styles.resetButton, { borderColor: theme.border }]} onPress={onReset}><Text style={[styles.backText, { color: theme.primary }]}>Reset</Text></Pressable>
        </View>
      </View>
    </Modal>
  );
}

function Choice({ label, active, onPress, theme }) {
  return <Pressable onPress={onPress} style={[styles.choice, { backgroundColor: active ? theme.primary : theme.tag }]}><Text style={{ color: active ? '#fff' : theme.text }}>{label}</Text></Pressable>;
}

function SkeletonList({ theme }) {
  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}> 
      {[1, 2, 3, 4].map((item) => <View key={item} style={[styles.skeletonCard, { backgroundColor: theme.card, borderColor: theme.border }]}><View style={styles.skeletonLine} /><View style={[styles.skeletonLine, { width: '65%' }]} /><View style={[styles.skeletonLine, { width: '40%' }]} /></View>)}
    </View>
  );
}

function EmptyState({ theme }) {
  return <View style={styles.emptyState}><Text style={[styles.detailTitle, { color: theme.text }]}>No jobs found</Text><Text style={[styles.bodyText, { color: theme.muted }]}>Try another search or reset filters.</Text></View>;
}

function ApplicationsScreen({ theme }) {
  return (
    <ScrollView style={[styles.screen, { backgroundColor: theme.background }]} contentContainerStyle={styles.tabContent}>
      <Text style={[styles.detailTitle, { color: theme.text }]}>My Applications</Text>
      {MOCK_PROPOSALS.map((proposal) => <View key={proposal.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}><Text style={[styles.jobTitle, { color: theme.text }]}>{proposal.title}</Text><Text style={[styles.employer, { color: theme.muted }]}>{proposal.employer}</Text><Text style={[styles.statusBadge, { backgroundColor: statusColors[proposal.status] }]}>{proposal.status}</Text></View>)}
    </ScrollView>
  );
}

function MessagesScreen({ onOpenChat, theme }) {
  return (
    <ScrollView style={[styles.screen, { backgroundColor: theme.background }]} contentContainerStyle={styles.tabContent}>
      <Text style={[styles.detailTitle, { color: theme.text }]}>Messages</Text>
      {MOCK_CONVERSATIONS.map((conversation) => <Pressable key={conversation.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => onOpenChat(conversation)}><Text style={[styles.jobTitle, { color: theme.text }]}>{conversation.name}</Text><Text style={[styles.employer, { color: theme.muted }]}>{conversation.last}</Text></Pressable>)}
    </ScrollView>
  );
}

function ChatScreen({ conversation, onBack, theme }) {
  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}> 
      <Pressable onPress={onBack} style={styles.backButton}><Text style={[styles.backText, { color: theme.primary }]}>Back</Text></Pressable>
      <Text style={[styles.detailTitle, { color: theme.text }]}>{conversation.name}</Text>
      <View style={[styles.bubble, styles.receivedBubble]}><Text>Hi, I saw your proposal.</Text></View>
      <View style={[styles.bubble, styles.sentBubble]}><Text style={{ color: '#fff' }}>Thank you. I am available to start.</Text></View>
      <View style={[styles.bubble, styles.receivedBubble]}><Text>{conversation.last}</Text></View>
    </View>
  );
}

function ProfileScreen({ darkMode, setDarkMode, theme }) {
  return (
    <ScrollView style={[styles.screen, { backgroundColor: theme.background }]} contentContainerStyle={styles.tabContent}>
      <Text style={[styles.detailTitle, { color: theme.text }]}>Profile</Text>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.jobTitle, { color: theme.text }]}>NJAJI SIBONA</Text>
        <Text style={[styles.employer, { color: theme.muted }]}>Member since May 2026</Text>
        <Text style={[styles.budgetLarge, { color: theme.primary }]}>KES 124,000 total earnings</Text>
        <View style={styles.tagsRow}>{['React Native', 'Node.js', 'APIs'].map((skill) => <Text key={skill} style={[styles.skillTag, { backgroundColor: theme.tag, color: theme.text }]}>{skill}</Text>)}</View>
      </View>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Settings</Text>
        <View style={styles.switchRow}><Text style={[styles.bodyText, { color: theme.text }]}>Dark mode</Text><Switch value={darkMode} onValueChange={setDarkMode} /></View>
      </View>
    </ScrollView>
  );
}

function BottomTabs({ activeTab, setActiveTab, theme }) {
  const tabs = ['Home', 'Applications', 'Messages', 'Profile'];
  return (
    <View style={[styles.tabBar, { backgroundColor: theme.card, borderColor: theme.border }]}> 
      {tabs.map((tab) => <Pressable key={tab} onPress={() => setActiveTab(tab)} style={styles.tabItem}><Text style={{ color: activeTab === tab ? theme.primary : theme.muted, fontWeight: activeTab === tab ? '800' : '600' }}>{tab}</Text>{tab === 'Applications' && <Text style={styles.notificationBadge}>2</Text>}</Pressable>)}
    </View>
  );
}

const lightTheme = {
  background: '#f4f7f9', card: '#ffffff', text: '#102a43', muted: '#627d98', primary: '#0f766e', primarySoft: '#ccfbf1', border: '#d9e2ec', chip: '#e0f2fe', tag: '#eef2ff', successSoft: '#dcfce7'
};
const darkTheme = {
  background: '#0f172a', card: '#1e293b', text: '#f8fafc', muted: '#cbd5e1', primary: '#2dd4bf', primarySoft: '#134e4a', border: '#334155', chip: '#164e63', tag: '#334155', successSoft: '#064e3b'
};

const styles = StyleSheet.create({
  safe: { flex: 1 }, screen: { flex: 1, paddingHorizontal: 16, paddingTop: 12 }, headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, logo: { fontSize: 24, fontWeight: '900' }, subtitle: { fontSize: 13, marginTop: 2 }, counter: { fontWeight: '700' }, searchInput: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12 }, feedList: { paddingBottom: 100 }, card: { borderWidth: 1, borderRadius: 18, padding: 14, marginBottom: 12 }, cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 }, avatar: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginRight: 10 }, avatarText: { fontWeight: '900', fontSize: 18 }, cardTitleWrap: { flex: 1 }, jobTitle: { fontSize: 16, fontWeight: '800' }, employer: { fontSize: 13, marginTop: 2 }, categoryChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, overflow: 'hidden', fontSize: 12, fontWeight: '700' }, budget: { fontSize: 18, fontWeight: '900', marginTop: 4 }, budgetLarge: { fontSize: 24, fontWeight: '900', marginVertical: 12 }, meta: { marginTop: 4 }, tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 6 }, skillTag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, overflow: 'hidden', marginRight: 6, marginBottom: 6, fontSize: 12, fontWeight: '600' }, fab: { position: 'absolute', right: 18, bottom: 88, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 24, elevation: 4 }, fabText: { color: '#fff', fontWeight: '900' }, sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }, sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 18, borderTopLeftRadius: 24, borderTopRightRadius: 24 }, label: { fontWeight: '800', marginVertical: 10 }, choice: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, marginRight: 8, marginBottom: 10 }, actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 }, primaryButton: { paddingVertical: 14, paddingHorizontal: 18, borderRadius: 14, alignItems: 'center', marginTop: 16 }, primaryButtonText: { color: '#fff', fontWeight: '900' }, resetButton: { borderWidth: 1, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 18 }, backButton: { paddingVertical: 10 }, backText: { fontWeight: '800' }, detailContent: { paddingBottom: 40 }, detailTitle: { fontSize: 24, fontWeight: '900', marginBottom: 8 }, sectionTitle: { fontSize: 16, fontWeight: '900', marginTop: 16, marginBottom: 6 }, bodyText: { fontSize: 15, lineHeight: 22 }, successBox: { padding: 14, borderRadius: 14, marginTop: 16 }, successText: { color: '#166534', fontWeight: '900' }, modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }, paymentModal: { padding: 18, borderTopLeftRadius: 24, borderTopRightRadius: 24 }, switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 }, centerBlock: { alignItems: 'center', padding: 16 }, infoText: { fontWeight: '900', marginTop: 12 }, errorText: { color: '#dc2626', fontWeight: '900', marginTop: 12 }, secondaryButton: { alignItems: 'center', padding: 12 }, skeletonCard: { borderWidth: 1, borderRadius: 18, padding: 18, marginBottom: 14 }, skeletonLine: { height: 16, backgroundColor: '#cbd5e1', borderRadius: 8, marginBottom: 12, width: '85%' }, emptyState: { padding: 24, alignItems: 'center' }, tabBar: { flexDirection: 'row', borderTopWidth: 1, paddingTop: 8, paddingBottom: 12 }, tabItem: { flex: 1, alignItems: 'center' }, notificationBadge: { position: 'absolute', top: -8, right: 18, backgroundColor: '#dc2626', color: '#fff', borderRadius: 8, overflow: 'hidden', paddingHorizontal: 5, fontSize: 11, fontWeight: '900' }, tabContent: { paddingBottom: 100 }, statusBadge: { color: '#fff', fontWeight: '900', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, overflow: 'hidden', marginTop: 10 }, bubble: { padding: 12, borderRadius: 16, marginVertical: 8, maxWidth: '80%' }, receivedBubble: { backgroundColor: '#e2e8f0', alignSelf: 'flex-start' }, sentBubble: { backgroundColor: '#0f766e', alignSelf: 'flex-end' }
});

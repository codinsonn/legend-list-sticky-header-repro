import { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SectionList } from '@legendapp/list/section-list';

type TxKind = 'topup' | 'payment';

type Tx = {
  id: string;
  kind: TxKind;
  label: string;
  /** ISO date YYYY-MM-DD */
  date: string;
};

type DaySection = {
  key: string;
  title: string;
  data: Tx[];
};

type Filter = 'all' | 'topup' | 'payment';

function buildFakeTransactions(): Tx[] {
  const days = [
    '2026-11-02',
    '2026-11-01',
    '2026-10-31',
    '2026-10-30',
    '2026-10-29',
    '2026-10-28',
    '2026-10-27',
    '2026-10-26',
    '2026-10-25',
    '2026-10-24',
  ];
  const merchants = [
    'DELHAIZE',
    'CARREFOUR',
    'ALBERT HEIJN',
    'COLRUYT',
    'SPAR',
    'LIDL',
  ];
  const rows: Tx[] = [];
  let id = 0;
  for (const date of days) {
    rows.push({
      id: `topup-${id++}`,
      kind: 'topup',
      label: 'Top up',
      date,
    });
    const paymentCount = 2 + (id % 3);
    for (let i = 0; i < paymentCount; i++) {
      rows.push({
        id: `pay-${id++}`,
        kind: 'payment',
        label: merchants[(id + i) % merchants.length],
        date,
      });
    }
  }
  return rows;
}

const ALL_TRANSACTIONS = buildFakeTransactions();

function groupByDay(transactions: Tx[]): DaySection[] {
  const sections: DaySection[] = [];
  for (const tx of transactions) {
    const last = sections.at(-1);
    if (last?.key === tx.date) {
      last.data.push(tx);
    } else {
      sections.push({
        key: tx.date,
        title: formatDayTitle(tx.date),
        data: [tx],
      });
    }
  }
  return sections;
}

function formatDayTitle(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
  });
}

function filterTransactions(transactions: Tx[], filter: Filter): Tx[] {
  if (filter === 'all') {
    return transactions;
  }
  return transactions.filter((t) => t.kind === filter);
}

function SectionHeader({ title }: { title: string }): React.JSX.Element {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );
}

function Row({ tx }: { tx: Tx }): React.JSX.Element {
  const isTopUp = tx.kind === 'topup';
  return (
    <View style={styles.row}>
      <Text style={styles.rowTitle} numberOfLines={1}>
        {tx.label}
      </Text>
      <Text style={[styles.rowAmount, isTopUp && styles.rowAmountTopUp]}>
        {isTopUp ? '+€160.00' : '-€12.34'}
      </Text>
    </View>
  );
}

function FilterTab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tab, active && styles.tabActive]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function App(): React.JSX.Element {
  const [filter, setFilter] = useState<Filter>('payment');
  const [stickyEnabled, setStickyEnabled] = useState(true);
  const [remountOnFilter, setRemountOnFilter] = useState(false);

  const sections = useMemo(
    () => groupByDay(filterTransactions(ALL_TRANSACTIONS, filter)),
    [filter]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.toolbar}>
        <Text style={styles.title}>Sticky header repro</Text>
        <Text style={styles.subtitle}>@legendapp/list 3.7.0 · iOS New Arch</Text>
        <View style={styles.tabs}>
          <FilterTab
            label="All"
            active={filter === 'all'}
            onPress={() => setFilter('all')}
          />
          <FilterTab
            label="Top ups"
            active={filter === 'topup'}
            onPress={() => setFilter('topup')}
          />
          <FilterTab
            label="Payments"
            active={filter === 'payment'}
            onPress={() => setFilter('payment')}
          />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Sticky headers</Text>
          <Switch value={stickyEnabled} onValueChange={setStickyEnabled} />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Remount list on filter (workaround)</Text>
          <Switch value={remountOnFilter} onValueChange={setRemountOnFilter} />
        </View>
        <Text style={styles.hint}>
          Repro: Payments → scroll down → All. Watch day headers below the fold.
        </Text>
      </View>
      <SectionList
        key={remountOnFilter ? filter : undefined}
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={stickyEnabled}
        renderSectionHeader={({ section }) => (
          <SectionHeader title={section.title} />
        )}
        renderSectionFooter={() => <View style={styles.sectionFooter} />}
        renderItem={({ item }) => <Row tx={item} />}
        estimatedItemSize={70}
        recycleItems
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const HEADER_HEIGHT = 36;
const FOOTER_HEIGHT = 16;
const ROW_HEIGHT = 69;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  toolbar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#e8e8ed',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  tabLabelActive: {
    color: '#111',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  toggleLabel: {
    fontSize: 14,
    flex: 1,
    paddingRight: 8,
  },
  hint: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    marginBottom: 4,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  sectionHeader: {
    height: HEADER_HEIGHT,
    justifyContent: 'center',
    backgroundColor: '#f5f5f7',
  },
  sectionHeaderText: {
    fontSize: 14,
    color: '#666',
  },
  sectionFooter: {
    height: FOOTER_HEIGHT,
  },
  row: {
    height: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: StyleSheet.hairlineWidth,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  rowAmount: {
    fontSize: 14,
    fontWeight: '500',
  },
  rowAmountTopUp: {
    color: '#0a7',
  },
});

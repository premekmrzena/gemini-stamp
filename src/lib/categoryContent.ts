// Známky a Známkové archy se na eshopu vypisují společně na obou slugech.
export const CATEGORY_GROUPS: Record<string, string[]> = {
  'znamky': ['znamky', 'znamkove-archy'],
  'znamkove-archy': ['znamky', 'znamkove-archy'],
};

// 'kreativni-archy' nemá vlastní stránku kategorie – nahrazeno editorem na /vytvorit-arch.
// Názvy a popisy kategorií žijí v messages/*.json (namespace "category"), ne tady –
// je to malá pevná množina hodnot, viz docs/09-jazykove-mutace.md.
export const INDEXABLE_CATEGORY_SLUGS = ['znamky', 'znamkove-archy', 'fdc', 'plakety'];

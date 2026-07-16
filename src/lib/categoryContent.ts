export const CATEGORY_CONTENT: Record<string, { title: string; description: string }> = {
  'znamky': {
    title: 'Poštovní známky',
    description: 'Každá známka je hodnotnou ceninou, sběratelským unikátem a mistrovským uměleckým dílem, které vypráví ty nejsilnější příběhy starého kontinentu. Nahlédněte do světa české známkové tvorby, která je celosvětově uznávaným fenoménem.',
  },
  'znamkove-archy': {
    title: 'Známkové archy',
    description: 'Zde doplň svůj vlastní text pro kategorii Známkové archy.',
  },
  'fdc': {
    title: 'First Day Cover (FDC)',
    description: 'First Day Cover (FDC) je obálka, pohlednice nebo dopisnice s nově vydanou poštovní známkou, která je orazítkována první den jejího oficiálního vydání. Pro filatelisty jde o sběratelsky velmi ceněný a vyhledávaný artikl, který slouží jako historický dokument.',
  },
  'plakety': {
    title: 'Dárkové plakety',
    description: 'Dárkové plakety zvýrazňují samotnou známku a dopřávají ji prostor vyniknout. Samotnou destičku nabízíme ve stříbrném nebo mosazném provedení. Můžete si vybrat s gravírovanými vzory a různými okraji.',
  },
};

// Známky a Známkové archy se na eshopu vypisují společně na obou slugech.
export const CATEGORY_GROUPS: Record<string, string[]> = {
  'znamky': ['znamky', 'znamkove-archy'],
  'znamkove-archy': ['znamky', 'znamkove-archy'],
};

// 'kreativni-archy' nemá vlastní stránku kategorie – nahrazeno editorem na /vytvorit-arch.
export const INDEXABLE_CATEGORY_SLUGS = ['znamky', 'znamkove-archy', 'fdc', 'plakety'];

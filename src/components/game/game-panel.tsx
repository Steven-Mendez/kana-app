import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { Caption, Halftone } from '@/components/game/comic';
import { Depth } from '@/components/game/depth';
import { cn } from '@/lib/utils';

/**
 * A comic panel: outline, hard offset shadow, an optional caption box
 * breaking its top border and optional halftone dots behind the content.
 * `quiet` (soft line and shade) for information; `loud` (full ink) for
 * results and celebrations.
 */
export function GamePanel({
  children,
  caption,
  captionTone,
  emphasis = 'quiet',
  halftone = false,
  className,
  testID,
}: {
  children: ReactNode;
  caption?: string;
  captionTone?: 'soft' | 'ink' | 'primary' | 'gold';
  emphasis?: 'quiet' | 'loud';
  halftone?: boolean;
  className?: string;
  testID?: string;
}) {
  const loud = emphasis === 'loud';
  return (
    <View testID={testID} className={caption ? 'pt-3' : undefined}>
      <Depth
        depth={loud ? 5 : 4}
        shapeClassName="rounded-card"
        faceClassName={cn(
          'gap-3 bg-card p-4 sm:p-5',
          loud && 'border-[2.5px] border-ink',
          caption && 'pt-6',
          className,
        )}
        edgeClassName={loud ? 'bg-ink' : 'bg-shade'}
      >
        {halftone ? <Halftone className="rounded-card" /> : null}
        {caption ? (
          <Caption
            tone={captionTone ?? (loud ? 'ink' : 'soft')}
            className="absolute -top-3.5 left-4"
          >
            {caption}
          </Caption>
        ) : null}
        {children}
      </Depth>
    </View>
  );
}

/** Small muted label above a panel's title. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <Text className="font-ui-bold text-[13px] text-muted-foreground">
      {children}
    </Text>
  );
}

/** A section title between panels. */
export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Text
      accessibilityRole="header"
      className="font-display text-xl text-foreground"
    >
      {children}
    </Text>
  );
}

import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useCSSVariable } from 'uniwind';

export function Icon({
  name,
  color = 'foreground',
  size = 22,
}: {
  name: SymbolViewProps['name'];
  color?:
    | 'foreground'
    | 'primary'
    | 'primary-foreground'
    | 'muted-foreground'
    | 'background'
    | 'success'
    | 'error';
  size?: number;
}) {
  const tint = useCSSVariable(`--color-${color}`);
  return (
    <SymbolView
      name={name}
      size={size}
      tintColor={typeof tint === 'string' ? tint : undefined}
      style={{ width: size, height: size }}
      accessible={false}
    />
  );
}

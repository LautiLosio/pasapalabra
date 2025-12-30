import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Pasapalabra - Organiza tu competencia en casa';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';

// Neumorphic shadow helpers matching app's glass/btn-neu style
const neuShadow = `
  inset 0 1px 1px rgba(255, 255, 255, 0.1),
  inset 0 -1px 2px rgba(0, 0, 0, 0.15),
  0 4px 12px rgba(0, 0, 0, 0.25),
  0 2px 4px rgba(0, 0, 0, 0.15)
`;

const glassShadow = `
  inset 0 1px 2px rgba(255, 255, 255, 0.15),
  inset 0 -1px 1px rgba(0, 0, 0, 0.2),
  0 8px 28px rgba(0, 0, 0, 0.25),
  0 3px 8px rgba(0, 0, 0, 0.12)
`;

export default async function OGImage() {
  const fredokaFont = await fetch(
    new URL('https://fonts.gstatic.com/s/fredoka/v14/X7nP4b87HvSqjb_WIi2yDCRwoQ_k7367_B-i2yQag0-mac3O.woff2')
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #0c0a1d 0%, #151228 40%, #1e1a36 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle background glows */}
        <div
          style={{
            position: 'absolute',
            top: '-15%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            height: '45%',
            background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(59, 130, 246, 0.12), transparent)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-10%',
            right: '-5%',
            width: '50%',
            height: '50%',
            background: 'radial-gradient(ellipse, rgba(249, 115, 22, 0.08), transparent)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-10%',
            left: '-5%',
            width: '40%',
            height: '40%',
            background: 'radial-gradient(ellipse, rgba(59, 130, 246, 0.06), transparent)',
            display: 'flex',
          }}
        />

        {/* Rosco ring with neumorphic glass container */}
        <div
          style={{
            width: 340,
            height: 340,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            background: 'rgba(255, 255, 255, 0.03)',
            boxShadow: glassShadow,
          }}
        >
          {/* Letters around the ring */}
          {ALPHABET.split('').map((letter, i) => {
            const angle = (i / 27) * 2 * Math.PI - Math.PI / 2;
            const radius = 145;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            // Game state colors: pending (blue), correct (green), incorrect (red), skipped (gray)
            const stateColors = [
              { bg: 'rgba(59, 130, 246, 0.25)', border: 'rgba(59, 130, 246, 0.4)' },   // pending blue
              { bg: 'rgba(34, 197, 94, 0.3)', border: 'rgba(34, 197, 94, 0.5)' },      // correct green
              { bg: 'rgba(107, 114, 128, 0.2)', border: 'rgba(107, 114, 128, 0.3)' },  // skipped gray
            ];
            
            // Simulate a game in progress
            const state = i < 5 ? 1 : i < 8 ? 2 : 0;
            const colors = stateColors[state];
            
            return (
              <div
                key={letter}
                style={{
                  position: 'absolute',
                  left: 170 + x - 18,
                  top: 170 + y - 18,
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: state === 1 ? 'rgba(34, 197, 94, 1)' : state === 2 ? 'rgba(156, 163, 175, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: 'Fredoka',
                  boxShadow: `
                    inset 0 1px 1px rgba(255, 255, 255, 0.08),
                    inset 0 -1px 1px rgba(0, 0, 0, 0.1),
                    0 2px 6px rgba(0, 0, 0, 0.2)
                  `,
                }}
              >
                {letter}
              </div>
            );
          })}

          {/* Center glass panel */}
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: neuShadow,
            }}
          >
            <span
              style={{
                fontSize: 44,
                fontFamily: 'Fredoka',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #3b82f6, #9333ea)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              P
            </span>
          </div>
        </div>

        {/* Title section with glass card */}
        <div
          style={{
            marginTop: 28,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px 40px',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 20,
            border: '1px solid rgba(255, 255, 255, 0.06)',
            boxShadow: `
              inset 0 1px 1px rgba(255, 255, 255, 0.06),
              inset 0 -1px 1px rgba(0, 0, 0, 0.08),
              0 4px 16px rgba(0, 0, 0, 0.15)
            `,
          }}
        >
          <span
            style={{
              fontSize: 52,
              fontWeight: 700,
              fontFamily: 'Fredoka',
              color: 'white',
              letterSpacing: '-0.02em',
            }}
          >
            Pasapalabra
          </span>
          <span
            style={{
              fontSize: 22,
              color: 'rgba(255, 255, 255, 0.6)',
              fontWeight: 500,
              marginTop: 4,
            }}
          >
            Organiza tu competencia en casa
          </span>
        </div>

        {/* Bottom features with neumorphic pills */}
        <div
          style={{
            position: 'absolute',
            bottom: 28,
            display: 'flex',
            gap: 12,
            alignItems: 'center',
          }}
        >
          {['Genera roscos con IA', 'Multijugador', 'Gratis'].map((text, i) => (
            <div
              key={text}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 12,
                border: '1px solid rgba(255, 255, 255, 0.06)',
                boxShadow: `
                  inset 0 1px 1px rgba(255, 255, 255, 0.05),
                  inset 0 -1px 1px rgba(0, 0, 0, 0.06)
                `,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: i === 0 ? '#3b82f6' : i === 1 ? '#f97316' : '#22c55e',
                  display: 'flex',
                }}
              />
              <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 13, fontWeight: 500 }}>
                {text}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Fredoka',
          data: fredokaFont,
          style: 'normal',
          weight: 700,
        },
      ],
    }
  );
}

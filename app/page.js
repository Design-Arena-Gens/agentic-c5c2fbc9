import FloorPlan from "@/components/FloorPlan";

export default function Page() {
  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 8 }}>Ground Floor Plan</h1>
      <p style={{ marginTop: 0, color: '#555' }}>
        Hall: 24 ft ? 12 ft; Each side has two rooms 12 ft ? 11 ft; Stair at one hall corner; Storey height: 11.6 ft.
      </p>
      <FloorPlan />
      <section style={{ marginTop: 24, color: '#333' }}>
        <h3 style={{ marginBottom: 8 }}>?????</h3>
        <ul style={{ lineHeight: 1.7 }}>
          <li>???: 24 ? 12 ????</li>
          <li>????? ???: 12 ? 11 ???? ?? ??-?? ????</li>
          <li>?????: ??? ?? ?? ???? ??</li>
          <li>?? ?? ?????: 11.6 ????</li>
        </ul>
      </section>
    </main>
  );
}

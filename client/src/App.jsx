import { useEffect, useState } from "react";

// ---- EDIT THESE FOR YOUR BUSINESS ----
const BIZ = {
  name: "MKR Service Center",
  phone: "+91 9363481184",
  hours: "9.30 am – 6.30 pm, all days",
  area: "Hosur & nearby areas",
};

const STEPS = [
  ["1. Call or book online", "Describe your appliance problem and choose a convenient date and time."],
  ["2. Verified technician assigned", "An experienced, verified technician arrives at your door with proper tools."],
  ["3. Itemized quote before repair", "You get a complete transparent price diagnosis before any work starts."],
  ["4. Fix done with testing", "Approve the quote and your appliance is repaired, tested, and back in action."],
];

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const api = async (endpoint, opts = {}, token) => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const targetUrl = API_BASE
    ? (API_BASE.endsWith("/api") && cleanEndpoint.startsWith("/api")
        ? `${API_BASE}${cleanEndpoint.slice(4)}`
        : `${API_BASE}${cleanEndpoint}`)
    : cleanEndpoint;

  const r = await fetch(targetUrl, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  let data;
  try {
    data = await r.json();
  } catch {
    data = {};
  }
  if (!r.ok) throw new Error(data.message || "Something went wrong.");
  return data;
};

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 820) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="nav-header">
      <div className="nav-wrapper">
        <a href="#" className="brand">
          <span className="brand-badge">MKR</span>
          <span className="brand-title">{BIZ.name}</span>
        </a>

        {/* Desktop Navigation */}
        <nav className="desktop-menu">
          <a href="#services">Services</a>
          <a href="#prices">Prices</a>
          <a href="#process">How it works</a>
          <a href="#book" className="nav-book-link">Book Online</a>
          <a className="call-pill" href={`tel:${BIZ.phone}`}>
            <span>📞</span>
            <span>{BIZ.phone}</span>
          </a>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          className={`hamburger ${menuOpen ? "is-active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          type="button"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <div className="mobile-backdrop" onClick={() => setMenuOpen(false)}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <span className="drawer-title">{BIZ.name}</span>
              <button
                className="close-drawer-btn"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            <nav className="mobile-links">
              <a href="#services" onClick={() => setMenuOpen(false)}>
                🛠️ Services We Repair
              </a>
              <a href="#prices" onClick={() => setMenuOpen(false)}>
                🏷️ Transparent Prices
              </a>
              <a href="#process" onClick={() => setMenuOpen(false)}>
                ⚡ How It Works
              </a>
              <a href="#book" className="drawer-highlight" onClick={() => setMenuOpen(false)}>
                📅 Book a Technician
              </a>
              <a className="drawer-call-btn" href={`tel:${BIZ.phone}`} onClick={() => setMenuOpen(false)}>
                📞 Call {BIZ.phone}
              </a>
            </nav>
            <div className="mobile-drawer-footer">
              <p>🕒 {BIZ.hours}</p>
              <p>📍 {BIZ.area}</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Booking({ services, selectedAppliance }) {
  const empty = {
    name: "",
    phone: "",
    email: "",
    address: "",
    appliance: selectedAppliance || "",
    date: "",
    slot: "Any time",
    problem: "",
  };
  const [f, setF] = useState(empty);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedAppliance) {
      setF((prev) => ({ ...prev, appliance: selectedAppliance }));
    }
  }, [selectedAppliance]);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      await api("/api/bookings", { method: "POST", body: JSON.stringify(f) });
      setMsg({ ok: true, t: "✓ Booking confirmed! Our technician will call you shortly." });
      setF(empty);
    } catch (err) {
      setMsg({ ok: false, t: err.message || "Failed to submit booking. Please call us." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="booking-card" onSubmit={submit} id="book">
      <div className="booking-card-header">
        <h2>Book a Technician</h2>
        <p className="booking-card-sub">Verified doorstep service within 2 to 4 hours</p>
      </div>

      <div className="form-group">
        <label>Your Full Name *</label>
        <input required placeholder="Enter full name" value={f.name} onChange={set("name")} />
      </div>

      <div className="form-group">
        <label>Mobile Number *</label>
        <input required type="tel" placeholder="10-digit phone number" value={f.phone} onChange={set("phone")} />
      </div>

      <div className="form-group">
        <label>Email Address (optional)</label>
        <input type="email" placeholder="name@example.com" value={f.email} onChange={set("email")} />
      </div>

      <div className="form-group">
        <label>Doorstep Service Address *</label>
        <input required placeholder="House/Flat, street, area in Hosur" value={f.address} onChange={set("address")} />
      </div>

      <div className="form-group">
        <label>Choose Appliance to Repair *</label>
        <select required value={f.appliance} onChange={set("appliance")}>
          <option value="">-- Select an appliance --</option>
          {services.map((s) => (
            <option key={s._id} value={s.name}>
              {s.name} (Inspection from ₹{s.startingPrice})
            </option>
          ))}
          {services.length === 0 && (
            <>
              <option value="Kitchen Chimney">Kitchen Chimney</option>
              <option value="Refrigerator">Refrigerator</option>
              <option value="Washing Machine">Washing Machine</option>
              <option value="Air Conditioner">Air Conditioner</option>
              <option value="Dishwasher">Dishwasher</option>
              <option value="Built-in Oven & Microwave">Built-in Oven & Microwave</option>
              <option value="Hob & Cooktop">Hob & Cooktop</option>
            </>
          )}
        </select>
      </div>

      <div className="row-2">
        <div className="form-group">
          <label>Preferred Date *</label>
          <input
            required
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            value={f.date}
            onChange={set("date")}
          />
        </div>
        <div className="form-group">
          <label>Preferred Time Slot</label>
          <select value={f.slot} onChange={set("slot")}>
            {["Any time", "Morning (9am - 1pm)", "Afternoon (1pm - 5pm)", "Evening (5pm - 8pm)"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>What is the issue? (optional)</label>
        <textarea
          rows="3"
          placeholder="E.g., chimney suction weak, fridge not cooling, washer noise"
          value={f.problem}
          onChange={set("problem")}
        />
      </div>

      <button className="submit-booking-btn" disabled={loading}>
        {loading ? "Submitting Booking..." : "Confirm Booking →"}
      </button>

      {msg && <div className={`status-alert ${msg.ok ? "alert-success" : "alert-error"}`}>{msg.t}</div>}
    </form>
  );
}

const TERMS = [
  "All service charges exclude applicable government taxes.",
  "Extra travel conveyance applies for visits outside municipal limits.",
  "Standard servicing covers inspection, deep cleaning, and tune-up. Required spare parts are quoted extra before replacement.",
  "Replacement filters (charcoal/baffle) are billed separately based on brand and model.",
  "Core cutting and granite masonry modifications are not included.",
];

function Prices() {
  const [rows, setRows] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    api("/api/prices").then(setRows).catch(() => {});
  }, []);

  const groups = (Array.isArray(rows) ? rows : []).reduce(
    (g, r) => ((g[r.category] ||= []).push(r), g),
    {}
  );

  const categories = ["All", ...Object.keys(groups)];

  return (
    <section id="prices" className="section-wrap">
      <div className="section-head">
        <span className="section-tag">RATE CARD</span>
        <h2>Transparent & Fixed Price List</h2>
        <p className="section-sub">
          Honest pricing with no surprises. You approve the quote before any work starts.
        </p>
      </div>

      {categories.length > 2 && (
        <div className="price-category-filters">
          {categories.map((c) => (
            <button
              key={c}
              className={`cat-btn ${activeCategory === c ? "active" : ""}`}
              onClick={() => setActiveCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="price-grid">
        {Object.entries(groups)
          .filter(([cat]) => activeCategory === "All" || activeCategory === cat)
          .map(([cat, items]) => (
            <div key={cat} className="price-category-card">
              <div className="price-category-header">
                <h3>{cat}</h3>
                <span className="price-count">{items.length} services</span>
              </div>
              <div className="table-responsive">
                <table className="price-table">
                  <tbody>
                    {items.map((r) => (
                      <tr key={r._id}>
                        <td className="item-details">
                          <div className="item-name">{r.name}</div>
                          {r.note && <div className="item-note">ℹ️ {r.note}</div>}
                        </td>
                        <td className="item-price">
                          {r.price ? (
                            <span className="price-tag">₹{r.price}</span>
                          ) : (
                            <span className="price-tag free">Free</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
      </div>

      <div className="terms-callout">
        <h4>📋 Terms & Service Conditions</h4>
        <ul className="terms-list">
          {TERMS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Home() {
  const [services, setServices] = useState([]);
  const [selectedAppliance, setSelectedAppliance] = useState("");

  useEffect(() => {
    api("/api/services").then(setServices).catch(() => {});
  }, []);

  const handleBookService = (name) => {
    setSelectedAppliance(name);
    const bookEl = document.getElementById("book");
    if (bookEl) {
      bookEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="page-wrapper">
      <Header />

      {/* Hero Section */}
      <section className="hero-banner">
        <div className="hero-intro">
          <div className="hero-pill">⭐ Trusted Doorstep Service in {BIZ.area}</div>
          <h1 className="hero-heading">
            Broken Appliance?<br />
            <span className="hero-highlight">Fixed At Your Door.</span>
          </h1>
          <p className="hero-desc">
            Expert technicians for chimneys, refrigerators, washing machines, ACs, microwaves, and hobs.
            Call before 12 noon for guaranteed same-day visits.
          </p>

          <div className="hero-perks">
            <div className="perk-item">
              <span className="perk-icon">⚡</span>
              <div>
                <strong>Same-Day Visit</strong>
                <p>Prompt technician arrival</p>
              </div>
            </div>
            <div className="perk-item">
              <span className="perk-icon">🏷️</span>
              <div>
                <strong>Upfront Pricing</strong>
                <p>No unexpected hidden costs</p>
              </div>
            </div>
            <div className="perk-item">
              <span className="perk-icon">🛡️</span>
              <div>
                <strong>Verified Experts</strong>
                <p>Trained & genuine parts</p>
              </div>
            </div>
          </div>

          <div className="hero-action-bar">
            <a href={`tel:${BIZ.phone}`} className="big-call-btn">
              <span>📞</span> Call Now: {BIZ.phone}
            </a>
            <div className="hero-timing">
              <span className="timing-bullet"></span> Open {BIZ.hours}
            </div>
          </div>
        </div>

        <div className="hero-form-wrapper">
          <Booking services={services} selectedAppliance={selectedAppliance} />
        </div>
      </section>

      {/* Services Grid Section */}
      <section id="services" className="section-wrap bg-light">
        <div className="section-head">
          <span className="section-tag">OUR SERVICES</span>
          <h2>Home Appliances We Repair</h2>
          <p className="section-sub">
            Specialized servicing with genuine spare parts and transparent service warranties.
          </p>
        </div>

        <div className="services-grid">
          {(Array.isArray(services) && services.length > 0 ? services : [
            { _id: "1", name: "Kitchen Chimney", description: "Motor servicing, suction repair, duct installation, and baffle filter cleaning.", startingPrice: 350 },
            { _id: "2", name: "Refrigerator", description: "Single/double door cooling issues, compressor repair, gas refill, and thermostat faults.", startingPrice: 350 },
            { _id: "3", name: "Washing Machine", description: "Top/front load drum issues, motor faults, water drainage, vibration, and PCB repairs.", startingPrice: 350 },
            { _id: "4", name: "Air Conditioner", description: "Split/window AC cooling, gas leak check, deep cleaning, capacitor, and PCB servicing.", startingPrice: 350 },
            { _id: "5", name: "Dishwasher", description: "Drainage blockage, pump repair, spray arm cleaning, and door lock replacements.", startingPrice: 350 },
            { _id: "6", name: "Built-in Oven & Microwave", description: "Heating element repair, magnetron replacement, touch panel, and turntable faults.", startingPrice: 350 },
            { _id: "7", name: "Hob & Cooktop", description: "Burner nozzle cleaning, gas leak detection, spark ignition repair, and jet conversion.", startingPrice: 350 },
          ]).map((s) => (
            <div key={s._id} className="service-card">
              <div className="service-card-body">
                <div className="service-icon-bubble">🔧</div>
                <h3>{s.name}</h3>
                <p>{s.description}</p>
              </div>
              <div className="service-card-footer">
                <div className="service-price">
                  <small>Visit & diagnosis from</small>
                  <strong>₹{s.startingPrice}</strong>
                </div>
                <button
                  type="button"
                  className="card-book-btn"
                  onClick={() => handleBookService(s.name)}
                >
                  Book This →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <Prices />

      {/* Steps Section */}
      <section id="process" className="section-wrap bg-light">
        <div className="section-head">
          <span className="section-tag">HOW IT WORKS</span>
          <h2>Doorstep Repair in 4 Simple Steps</h2>
          <p className="section-sub">Hassle-free service with total transparency from booking to completion.</p>
        </div>

        <div className="steps-cards">
          {STEPS.map(([title, desc], idx) => (
            <div key={title} className="step-card">
              <div className="step-num">0{idx + 1}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-wrap">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>{BIZ.name}</h3>
            <p>Reliable, prompt, and verified doorstep appliance repairs across {BIZ.area}.</p>
            <p>🕒 Working Hours: {BIZ.hours}</p>
          </div>
          <div className="footer-actions">
            <a href={`tel:${BIZ.phone}`} className="footer-call-pill">
              📞 {BIZ.phone}
            </a>
            <div className="footer-meta">
              <span>© {new Date().getFullYear()} {BIZ.name}. All rights reserved.</span>
              <a href="#admin" className="staff-link">🔐 Staff & Admin Login</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PriceManager({ token }) {
  const [rows, setRows] = useState([]);
  const [n, setN] = useState({ category: "", name: "", price: "", note: "" });
  const [filter, setFilter] = useState("");

  const load = () => api("/api/prices").then(setRows);
  useEffect(() => { load(); }, []);

  const edit = (id, k, v) => setRows(rows.map((r) => (r._id === id ? { ...r, [k]: v } : r)));
  const save = async (r) => {
    await api(`/api/prices/${r._id}`, { method: "PATCH", body: JSON.stringify(r) }, token);
    load();
  };
  const del = async (id) => {
    if (confirm("Delete this price item?")) {
      await api(`/api/prices/${id}`, { method: "DELETE" }, token);
      load();
    }
  };
  const add = async (e) => {
    e.preventDefault();
    await api(
      "/api/prices",
      { method: "POST", body: JSON.stringify({ ...n, price: Number(n.price), order: rows.length }) },
      token
    );
    setN({ category: "", name: "", price: "", note: "" });
    load();
  };

  const filteredRows = (Array.isArray(rows) ? rows : []).filter(
    (r) =>
      r.name?.toLowerCase().includes(filter.toLowerCase()) ||
      r.category?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h2>Manage Price List ({rows.length} items)</h2>
          <p>Add, modify, or delete services and rates visible on the public site.</p>
        </div>
        <input
          type="text"
          className="admin-search-input"
          placeholder="🔍 Search prices..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <form className="add-price-form" onSubmit={add}>
        <h3>Add New Price Entry</h3>
        <div className="add-price-grid">
          <input
            required
            placeholder="Category (e.g. Servicing, Installation)"
            value={n.category}
            onChange={(e) => setN({ ...n, category: e.target.value })}
          />
          <input
            required
            placeholder="Service Name (e.g. Motor Servicing)"
            value={n.name}
            onChange={(e) => setN({ ...n, name: e.target.value })}
          />
          <input
            required
            type="number"
            min="0"
            placeholder="Price (₹)"
            value={n.price}
            onChange={(e) => setN({ ...n, price: e.target.value })}
          />
          <input
            placeholder="Optional Note (e.g. Free, Excludes filters)"
            value={n.note}
            onChange={(e) => setN({ ...n, note: e.target.value })}
          />
          <button className="add-btn">+ Add Item</button>
        </div>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: "22%" }}>Category</th>
              <th style={{ width: "35%" }}>Service Name</th>
              <th style={{ width: "15%" }}>Price (₹)</th>
              <th style={{ width: "18%" }}>Notes</th>
              <th style={{ width: "10%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((r) => (
              <tr key={r._id}>
                <td>
                  <input
                    value={r.category || ""}
                    onChange={(e) => edit(r._id, "category", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    value={r.name || ""}
                    onChange={(e) => edit(r._id, "name", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={r.price ?? ""}
                    onChange={(e) => edit(r._id, "price", Number(e.target.value))}
                  />
                </td>
                <td>
                  <input
                    value={r.note || ""}
                    onChange={(e) => edit(r._id, "note", e.target.value)}
                  />
                </td>
                <td className="row-actions">
                  <button className="btn-save" onClick={() => save(r)} title="Save changes">💾 Save</button>
                  <button className="btn-del" onClick={() => del(r._id)} title="Delete item">🗑️ Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Admin() {
  const [token, setToken] = useState(sessionStorage.getItem("t") || "");
  const [cred, setCred] = useState({ username: "", password: "" });
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("bookings");

  const load = (t = token) =>
    api("/api/bookings", {}, t)
      .then(setRows)
      .catch((e) => {
        setErr(e.message);
        setToken("");
      });

  useEffect(() => {
    if (token) load();
  }, [token]);

  const login = async (e) => {
    e.preventDefault();
    try {
      const { token } = await api("/api/admin/login", { method: "POST", body: JSON.stringify(cred) });
      sessionStorage.setItem("t", token);
      setToken(token);
      setErr("");
    } catch (x) {
      setErr(x.message || "Invalid credentials.");
    }
  };

  const setStatus = async (id, status) => {
    await api(`/api/bookings/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }, token);
    load();
  };

  if (!token) {
    return (
      <div className="login-screen">
        <form className="login-box" onSubmit={login}>
          <div className="login-head">
            <span className="admin-badge">STAFF PORTAL</span>
            <h2>Sign in to MKR Service</h2>
            <p>Enter your staff credentials to manage bookings & pricing</p>
          </div>
          <div className="form-group">
            <label>Username</label>
            <input
              required
              placeholder="Enter username"
              value={cred.username}
              onChange={(e) => setCred({ ...cred, username: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              required
              type="password"
              placeholder="Enter password"
              value={cred.password}
              onChange={(e) => setCred({ ...cred, password: e.target.value })}
            />
          </div>
          <button className="login-btn">Log In to Dashboard →</button>
          {err && <div className="status-alert alert-error">{err}</div>}
          <div className="login-back">
            <a href="#">← Back to Public Website</a>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <header className="admin-nav-bar">
        <div className="admin-nav-brand">
          <strong>MKR Admin Dashboard</strong>
        </div>
        <div className="admin-tabs">
          <button
            onClick={() => setTab("bookings")}
            className={`tab-btn ${tab === "bookings" ? "tab-active" : ""}`}
          >
            📋 Bookings ({rows.length})
          </button>
          <button
            onClick={() => setTab("prices")}
            className={`tab-btn ${tab === "prices" ? "tab-active" : ""}`}
          >
            🏷️ Rate Card
          </button>
        </div>
        <div className="admin-nav-right">
          <a href="#" className="view-site-link">🌐 View Public Site</a>
          <button
            className="logout-btn"
            onClick={() => {
              sessionStorage.clear();
              setToken("");
            }}
          >
            🚪 Log Out
          </button>
        </div>
      </header>

      <main className="admin-main">
        {tab === "prices" ? (
          <PriceManager token={token} />
        ) : (
          <div className="admin-container">
            <div className="admin-header">
              <div>
                <h2>Customer Service Bookings ({rows.length})</h2>
                <p>Real-time booking requests submitted through the website.</p>
              </div>
              <button className="refresh-btn" onClick={() => load()}>🔄 Refresh List</button>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: "25%" }}>Customer & Phone</th>
                    <th style={{ width: "18%" }}>Appliance</th>
                    <th style={{ width: "17%" }}>Visit Schedule</th>
                    <th style={{ width: "25%" }}>Reported Problem</th>
                    <th style={{ width: "15%" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((b) => (
                    <tr key={b._id}>
                      <td>
                        <strong className="customer-name">{b.name}</strong>
                        <div className="customer-phone">
                          <a href={`tel:${b.phone}`}>📞 {b.phone}</a>
                        </div>
                        {b.email && <div className="customer-email">✉️ {b.email}</div>}
                        <div className="customer-addr">📍 {b.address}</div>
                      </td>
                      <td>
                        <span className="appliance-pill">{b.appliance}</span>
                      </td>
                      <td>
                        <div className="visit-date">📅 {b.date}</div>
                        <div className="visit-slot">⏰ {b.slot}</div>
                      </td>
                      <td>
                        <p className="problem-text">{b.problem || "No notes provided"}</p>
                      </td>
                      <td>
                        <select
                          className={`status-select status-${(b.status || "new").toLowerCase()}`}
                          value={b.status}
                          onChange={(e) => setStatus(b._id, e.target.value)}
                        >
                          {["New", "Assigned", "Quoted", "Completed", "Cancelled"].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan="5" className="empty-table-msg">
                        No bookings yet. New bookings will automatically appear here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  const [hash, setHash] = useState(location.hash);

  useEffect(() => {
    const h = () => setHash(location.hash);
    addEventListener("hashchange", h);
    return () => removeEventListener("hashchange", h);
  }, []);

  return hash === "#admin" ? <Admin /> : <Home />;
}
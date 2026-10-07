import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors(), express.json());

const Service = mongoose.model("Service", new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  startingPrice: Number,
}));

const Price = mongoose.model("Price", new mongoose.Schema({
  category: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  note: String,
  order: { type: Number, default: 0 },
}));

const Booking = mongoose.model("Booking", new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  address: { type: String, required: true },
  appliance: { type: String, required: true },
  date: { type: String, required: true },
  slot: { type: String, default: "Any time" },
  problem: String,
  status: { type: String, enum: ["New", "Assigned", "Quoted", "Completed", "Cancelled"], default: "New" },
}, { timestamps: true }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mkr_service";
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret";
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "change-this-password";

const auth = (req, res, next) => {
  try {
    const token = (req.headers.authorization || "").replace("Bearer ", "").trim();
    if (!token) return res.status(401).json({ message: "Please log in again." });
    jwt.verify(token, JWT_SECRET);
    next();
  } catch { res.status(401).json({ message: "Please log in again." }); }
};

// Public
app.get("/api/services", async (_, res) => res.json(await Service.find().sort("name")));

app.post("/api/bookings", async (req, res) => {
  try { res.status(201).json(await Booking.create(req.body)); }
  catch (e) { res.status(400).json({ message: "Please fill all required fields." }); }
});

app.get("/api/prices", async (_, res) => res.json(await Price.find().sort("order")));

// Admin
app.post("/api/prices", auth, async (req, res) => res.status(201).json(await Price.create(req.body)));
app.patch("/api/prices/:id", auth, async (req, res) => {
  const { name, price, note, category } = req.body;
  res.json(await Price.findByIdAndUpdate(req.params.id, { name, price, note, category }, { new: true }));
});
app.delete("/api/prices/:id", auth, async (req, res) => { await Price.findByIdAndDelete(req.params.id); res.json({ ok: true }); });
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body || {};
  if (username && password && username === ADMIN_USER && password === ADMIN_PASS)
    return res.json({ token: jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "8h" }) });
  res.status(401).json({ message: "Wrong username or password." });
});

app.get("/api/bookings", auth, async (_, res) => res.json(await Booking.find().sort("-createdAt")));
app.patch("/api/bookings/:id", auth, async (req, res) =>
  res.json(await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })));
app.post("/api/services", auth, async (req, res) => res.status(201).json(await Service.create(req.body)));
app.delete("/api/services/:id", auth, async (req, res) => { await Service.findByIdAndDelete(req.params.id); res.json({ ok: true }); });

const seed = [
  ["Kitchen Chimney", "Motor servicing, suction repair and filter cleaning.", 350],
  ["Refrigerator", "Cooling issues, compressor and gas problems.", 350],
  ["Washing Machine", "Drum, motor, drainage and PCB faults.", 350],
  ["Air Conditioner", "Gas refill, cooling issues and full servicing.", 350],
  ["Dishwasher", "Drainage, pump and door latch repairs.", 350],
  ["Built-in Oven & Microwave", "Magnetron, heating element and control board repair.", 350],
  ["Hob & Cooktop", "Burner ignition and gas flow problems.", 350],
];

try {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB at " + MONGO_URI);
} catch (err) {
  console.error("Failed to connect to MongoDB:", err.message);
  console.error("Please ensure MongoDB is running or configure MONGO_URI in server/.env");
  process.exit(1);
}
const C = { V: "Visit charges", I: "Installation", U: "Uninstallation", J: "Gas conversion (jet change)", S: "Servicing & cleaning", A: "Annual maintenance (AMC)", X: "Accessories" };
const priceSeed = [
  [C.V, "Visiting charge (pre-sale / post-sale, out of warranty)", 350, "Charged even if you decide not to go ahead with repair"],
  [C.V, "Pre-visit charge, all products", 250],
  [C.I, "Plug & Play chimney (standard models)", 0, "Free"],
  [C.I, "Plug & Play chimney (Kitty models)", 200],
  [C.I, "Kitchen hood, ducting mode", 500],
  [C.I, "Kitchen hood, recycling mode", 400],
  [C.I, "Kitchen hood, Kitty", 500],
  [C.I, "Built-in hob, LPG", 300],
  [C.I, "Built-in hob, CNG", 350],
  [C.I, "Cooktop, LPG", 200],
  [C.I, "Cooktop, CNG", 350],
  [C.I, "Dishwasher", 750],
  [C.I, "Warmer drawer", 300],
  [C.I, "Cooking range, LPG", 400],
  [C.I, "Cooking range, CNG", 450],
  [C.I, "Built-in oven / microwave oven", 300, "Cabinet must match the installation diagram in the manual"],
  [C.I, "Split unit fixing stand", 1000],
  [C.I, "Disposer", 300],
  [C.I, "Fryer / barbecue", 300],
  [C.I, "Sink", 300],
  [C.I, "Wine cooler", 500],
  [C.I, "Duct cutting", 200, "Core or granite cutting is not included; arrange a local mason"],
  [C.U, "Kitchen hood uninstallation", 250],
  [C.U, "Island kitchen hood uninstallation", 500],
  [C.J, "Cooking range, LPG to CNG or CNG to LPG", 450],
  [C.J, "Cooktop, LPG to CNG or CNG to LPG", 350],
  [C.J, "Built-in hob, LPG to CNG or CNG to LPG", 350],
  [C.S, "Kitchen hood servicing", 1500],
  [C.S, "Kitchen hood filter cleaning (up to 3 filters)", 850],
  [C.S, "Hob servicing", 850],
  [C.S, "Cooktop servicing", 350],
  [C.S, "Cooking range servicing", 1500],
  [C.S, "Built-in oven / microwave oven servicing", 450],
  [C.S, "Dishwasher servicing", 450],
  [C.S, "Warmer drawer servicing", 450],
  [C.S, "Disposer servicing", 300],
  [C.S, "Wine cooler servicing", 500],
  [C.S, "Fryer / barbecue servicing", 300],
  [C.A, "AMC, kitchen hood / built-in hob", 2500, "Non-comprehensive: spare parts not included"],
  [C.A, "AMC, built-in oven / microwave oven", 3500, "Non-comprehensive: spare parts not included"],
  [C.X, "Hood installation kit (6 inch aluminium duct 7-8 ft, 2 clamps, end cap, foil tape, screws and rawl plugs)", 899],
];
if (!(await Price.countDocuments()))
  await Price.insertMany(priceSeed.map(([category, name, price, note], order) => ({ category, name, price, note, order })));

if (!(await Service.countDocuments()))
  await Service.insertMany(seed.map(([name, description, startingPrice]) => ({ name, description, startingPrice })));
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));

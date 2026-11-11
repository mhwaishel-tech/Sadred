import { useEffect, useState, useRef } from "react";
import {
  Search,
  Plus,
  MapPin,
  Euro,
  Recycle,
  LogIn,
  LogOut,
  X,
  Send,
  Check,
  Clock,
  MessageCircle,
  Star,
  Package,
  User,Bell,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "./supabase";

type Listing = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  reward_eur: number;
  image_urls?: string[] | null;
  status: string;
  created_at: string;
};

type Offer = {
  id: string;
  listing_id: string;
  user_id: string;
  amount: number;
  message: string;
  status: string;
};

type Profile = {
  user_id: string;
  display_name: string | null;
  city: string | null;
  role: string;
};

type ChatMessage = {
  id: string;
  listing_id: string;
  sender_id: string;
  receiver_id: string;
  body: string;
  created_at: string;
};

const categories = [
  "Verhuizen",
  "Meubels ophalen",
  "Opruimen",
  "Tuinonderhoud",
  "Afval wegbrengen",
  "Andere klus",
];

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Alles");
  const [showLogin, setShowLogin] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);
  useEffect(() => {
  if (!enlargedImage) return;

  const oldOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  return () => {
    document.body.style.overflow = oldOverflow;
  };
}, [enlargedImage]);
  const [showOffer, setShowOffer] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [reward, setReward] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [editImageUrls, setEditImageUrls] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState(categories[0]);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [chatText, setChatText] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      setNotice("Supabase is nog niet ingesteld.");
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    loadData();
  }, [user]);
useEffect(() => {
  if (!supabase || !user) return;

  const channel = supabase
    .channel(`notifications-${user.id}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${user.id}`,
      },
      (payload) => {
        const newNotification = payload.new as any;

        setNotifications((previous) => [
          newNotification,
          ...previous,
        ]);

        setNotice(newNotification.message);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user]);
  async function loadData() {
    if (!supabase) return;

    setLoading(true);

    const { data: listingData, error } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setNotice("Kon de opdrachten niet laden.");
    } else {
      setListings((listingData ?? []) as Listing[]);
    }

    if (user) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      setProfile(profileData as Profile | null);
      const { data: profilesData } = await supabase
  .from("profiles")
  .select("*");

setAllProfiles((profilesData ?? []) as Profile[]);

      const { data: offerData } = await supabase
        .from("offers")
        .select("*");

      setOffers((offerData ?? []) as Offer[]);

      const { data: messageData } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });

      setMessages((messageData ?? []) as ChatMessage[]);
      const { data: notificationData } = await supabase
  .from("notifications")
  .select("*")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false });

setNotifications(notificationData ?? []);
    } else {
      setProfile(null);
      setOffers([]);
      setMessages([]);
    }

    setLoading(false);
  }
    async function handleAuth() {
    if (!supabase) return;

    if (isSignup) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setNotice(error.message);
        return;
      }

      if (data.user) {
        await supabase.from("profiles").upsert({
          user_id: data.user.id,
          display_name: name,
          role: "both",
        });
      }

      setNotice("Account aangemaakt. Controleer je e-mail indien nodig.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setNotice(error.message);
        return;
      }
    }

    setShowLogin(false);
    setEmail("");
    setPassword("");
    setName("");
  }

  async function handleLogout() {
    if (!supabase) return;

    await supabase.auth.signOut();
    setNotice("Je bent uitgelogd.");
  }
  async function createListing() {
    if (!supabase || !user) {
      setShowLogin(true);
      return;
    }

    if (!title.trim() || !city.trim() || !reward) {
      setNotice("Vul alle verplichte velden in.");
      return;
    }

    const imageUrls: string[] = [];

    for (let i = 0; i < selectedImages.length; i++) {
      const file = selectedImages[i];
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const filePath = `${user.id}/${Date.now()}-${i}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(filePath, file);

      if (uploadError) {
        setNotice(uploadError.message);
        return;
      }

      const { data } = supabase.storage
        .from("listing-images")
        .getPublicUrl(filePath);

      imageUrls.push(data.publicUrl);
    }

    const { error } = await supabase.from("listings").insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim(),
      category: newCategory,
      city: city.trim(),
      reward_eur: Number(reward),
      status: "active",
      image_urls: imageUrls,
    });

    if (error) {
      setNotice(error.message);
      return;
    }

    setTitle("");
    setDescription("");
    setCity("");
    setReward("");
    setSelectedImages([]);
    setShowCreate(false);
    setNotice("Je opdracht is geplaatst.");
    await loadData();
  }
    async function updateListing() {
    if (!supabase || !user || !selectedListing) return;

    if (selectedListing.user_id !== user.id) {
      setNotice("Je mag deze opdracht niet bewerken.");
      return;
    }

    if (!title.trim() || !city.trim() || !reward) {
      setNotice("Vul alle verplichte velden in.");
      return;
    }

  const imageUrls = [...editImageUrls];

    if (editImageUrls.length + selectedImages.length > 5) {
      setNotice("Maximaal 5 foto's toegestaan.");
      return;
    }

    for (let i = 0; i < selectedImages.length; i++) {
      const file = selectedImages[i];
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const filePath = `${user.id}/${Date.now()}-${i}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(filePath, file);

      if (uploadError) {
        setNotice(uploadError.message);
        return;
      }

      const { data } = supabase.storage
        .from("listing-images")
        .getPublicUrl(filePath);

      imageUrls.push(data.publicUrl);
    }

    const { error } = await supabase
      .from("listings")
      .update({
        title: title.trim(),
        description: description.trim(),
        category: newCategory,
        city: city.trim(),
        reward_eur: Number(reward),
        image_urls: imageUrls,
      })
      .eq("id", selectedListing.id)
      .eq("user_id", user.id);

    if (error) {
      setNotice(error.message);
      return;
    }
      const removedUrls = (selectedListing.image_urls ?? []).filter(
  (url) => !editImageUrls.includes(url)
);
const marker = "/storage/v1/object/public/listing-images/";
const removedPaths = removedUrls
  .map((url) => {
    const index = url.indexOf(marker);
    if (index === -1) return null;
    return decodeURIComponent(url.slice(index + marker.length));
  })
  .filter((path): path is string => Boolean(path));

if (removedPaths.length > 0) {
  const { error: removeError } = await supabase.storage
    .from("listing-images")
    .remove(removedPaths);
  if (removeError) setNotice(removeError.message);
}
setSelectedListing({
  ...selectedListing,
  title: title.trim(),
  description: description.trim(),
  category: newCategory,
  city: city.trim(),
  reward_eur: Number(reward),
  image_urls: imageUrls,
});
    setShowEdit(false);
    setSelectedImages([]);
      setEditImageUrls([]);
    setNotice("Opdracht bijgewerkt.");
    await loadData();
    }
  async function deleteListing() {
  if (!supabase || !user || !selectedListing) return;

  if (selectedListing.user_id !== user.id) {
    setNotice("Je mag deze opdracht niet verwijderen.");
    return;
  }

  if (!window.confirm("Weet je zeker dat je deze opdracht wilt verwijderen?")) {
    return;
  }

  const marker = "/storage/v1/object/public/listing-images/";

  const paths = (selectedListing.image_urls ?? [])
    .map((url) => {
      const index = url.indexOf(marker);
      if (index === -1) return null;
      return decodeURIComponent(url.slice(index + marker.length));
    })
    .filter((path): path is string => Boolean(path));

  if (paths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("listing-images")
      .remove(paths);

    if (storageError) {
      setNotice(storageError.message);
      return;
    }
  }

  const { data, error } = await supabase
    .from("listings")
    .delete()
    .eq("id", selectedListing.id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    setNotice(error?.message ?? "Advertentie kon niet worden verwijderd.");
    return;
  }

  setSelectedListing(null);
  setNotice("Opdracht verwijderd.");
  await loadData();
  }
  async function submitOffer() {
    if (!supabase || !user || !selectedListing) {
      setShowLogin(true);
      return;
    }

    if (!offerAmount || Number(offerAmount) < 0) {
      setNotice("Vul een geldig bedrag in.");
      return;
    }

    const { error } = await supabase.from("offers").insert({
      listing_id: selectedListing.id,
      user_id: user.id,
      amount: Number(offerAmount),
      message: offerMessage.trim(),
      status: "pending",
    });

    if (error) {
      setNotice(error.message);
      return;
    }
await supabase.from("notifications").insert({
  user_id: selectedListing.user_id,
  listing_id: selectedListing.id,
  type: "offer",
  message: "Je hebt een nieuw aanbod ontvangen.",
});
    setOfferAmount("");
    setOfferMessage("");
    setShowOffer(false);
    setNotice("Je aanbod is verstuurd.");
    await loadData();
  }

  async function updateOfferStatus(
    offer: Offer,
    status: "accepted" | "rejected"
  ) {
    if (!supabase || !user) return;

    const { error } = await supabase
      .from("offers")
      .update({ status })
      .eq("id", offer.id);

    if (error) {
      setNotice("Het aanbod kon niet worden bijgewerkt. Controleer de RLS-rechten.");
      return;
    }

    setNotice(
      status === "accepted"
        ? "Aanbod geaccepteerd."
        : "Aanbod afgewezen."
    );

    await loadData();
  }
;async function sendMessage() {
  if (!supabase || !user || !selectedListing || !chatText.trim()) {
    return;
  }

  let receiverId = selectedChatUserId;

  if (!receiverId) {
    const acceptedOffer = offers.find(
      (offer) =>
        offer.listing_id === selectedListing.id &&
        offer.status === "accepted"
    );

    if (!acceptedOffer) {
      setNotice("Er is nog geen geaccepteerd aanbod.");
      return;
    }

    receiverId =
      user.id === selectedListing.user_id
        ? acceptedOffer.user_id
        : selectedListing.user_id;
  }

  const { error } = await supabase.from("messages").insert({
    listing_id: selectedListing.id,
    sender_id: user.id,
    receiver_id: receiverId,
    body: chatText.trim(),
  });

  if (error) {
    setNotice("Bericht verzenden mislukt.");
    return;
  }
await supabase.from("notifications").insert({
  user_id: receiverId,
  listing_id: selectedListing.id,
  type: "message",
  message: "Je hebt een nieuw bericht ontvangen.",
});
  setChatText("");
  await loadData();
}
  

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(search.toLowerCase()) ||
      listing.city.toLowerCase().includes(search.toLowerCase()) ||
      listing.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "Alles" || listing.category === category;

    return (
      matchesSearch &&
      matchesCategory &&
      listing.status === "active"
    );
  });

  function openListing(listing: Listing) {
    setSelectedListing(listing);
    setShowOffer(false);
    setShowChat(false);
  }

  function closeDetails() {
    setSelectedListing(null);
    setShowOffer(false);
    setShowChat(false);
  }
    return (
    <main className="app">
      <header className="header">
        <a href="#" className="logo">
          <Recycle size={28} />
          <span>Sad Rad</span>
        </a>

        <nav>
          <a href="#opdrachten">Opdrachten</a>
          <a href="#hoe-werkt-het">Hoe werkt het?</a>
        </nav>
<button
  className="secondary-btn"
  onClick={() => user ? setShowInbox(true) : setShowLogin(true)}
>
  <MessageCircle size={17} /> Berichten
</button>
        <button
  className="secondary-btn"
  onClick={() => user && setShowNotifications(true)}
>
  <Bell size={17} /> Meldingen
  {notifications.filter((n) => !n.is_read).length > 0 && (
    <span>{notifications.filter((n) => !n.is_read).length}</span>
  )}
</button>
        <div className="header-actions">
          {user ? (
            <button onClick={handleLogout} className="secondary-btn">
              <LogOut size={17} /> Uitloggen
            </button>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="secondary-btn"
            >
              <LogIn size={17} /> Inloggen
            </button>
          )}

          <button
            onClick={() => (user ? setShowCreate(true) : setShowLogin(true))}
            className="primary-btn"
          >
            <Plus size={17} /> Opdracht plaatsen
          </button>
        </div>
      </header>

      {notice && (
        <div className="notice">
          {notice}
          <button onClick={() => setNotice("")}>
            <X size={16} />
          </button>
        </div>
      )}

      <section className="hero">
        <div className="hero-content">
          <div className="eyebrow">SAMEN MAKEN WE RUIMTE</div>
          <h1>Een klus gedaan.<br />Een ander geholpen.</h1>
          <p>
            Plaats je klus, ontvang aanbiedingen en vind iemand die je kan
            helpen.
          </p>
          <button
            className="primary-btn"
            onClick={() => (user ? setShowCreate(true) : setShowLogin(true))}
          >
            Plaats een opdracht <Plus size={18} />
          </button>
        </div>
        <div className="hero-icon">
          <Recycle size={100} />
        </div>
      </section>

      <section id="opdrachten" className="listings-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">ONTDEK OPDRACHTEN</div>
            <h2>Wie kan jou helpen?</h2>
          </div>
          <span>{filteredListings.length} opdrachten</span>
        </div>

        <div className="search-bar">
          <Search size={20} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Zoek op opdracht of stad..."
          />
        </div>

        <div className="categories">
          {["Alles", ...categories].map((item) => (
            <button
              key={item}
              className={category === item ? "category active" : "category"}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="empty-state">Laden...</p>
        ) : filteredListings.length === 0 ? (
          <div className="empty-state">
            <Package size={40} />
            <h3>Nog geen opdrachten gevonden</h3>
            <p>Probeer een andere zoekopdracht of plaats zelf een klus.</p>
          </div>
        ) : (
          <div className="listing-grid">
            {filteredListings.map((listing) => (
              <article className="listing-card" key={listing.id}>
                {listing.image_urls?.[0] && (
  <img
    src={listing.image_urls[0]}
    alt={listing.title}
    style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "12px" }}
  />
)}
                <div className="listing-card-content">
                  <span className="listing-category">{listing.category}</span>
                  <h3>{listing.title}</h3>
                  <p>{listing.description}</p>
                  <div className="listing-meta">
                    <span><MapPin size={15} /> {listing.city}</span>
                    <strong><Euro size={15} /> {listing.reward_eur}</strong>
                  </div>
                  <button
                    className="primary-btn full-btn"
                    onClick={() => openListing(listing)}
                  >
                    Bekijk opdracht
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="hoe-werkt-het" className="how">
        <div className="eyebrow">ZO WERKT SAD RAD</div>
        <h2>Hulp vragen of aanbieden.<br />Het begint hier.</h2>
        <div className="how-grid">
          <div><Plus size={28} /><h3>1. Plaats een klus</h3><p>Vertel wat je nodig hebt en wat je ervoor betaalt.</p></div>
          <div><Send size={28} /><h3>2. Ontvang aanbiedingen</h3><p>Ontvang reacties van mensen die je willen helpen.</p></div>
          <div><Check size={28} /><h3>3. Kies en spreek af</h3><p>Kies een aanbieder en bespreek de details.</p></div>
        </div>
      </section>

      {selectedListing && (
        <div className="modal-backdrop" onClick={closeDetails}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <button className="close-btn" onClick={closeDetails}><X /></button>
            <span className="listing-category">{selectedListing.category}</span>
            <h2>{selectedListing.title}</h2>
<div style={{
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "12px",
  margin: "15px 0"
}}>
  {selectedListing.image_urls?.map((url, index) => (
    <img
      key={index}
      src={url}
      onClick={() => setEnlargedImage(url)}
      alt={`Foto ${index + 1}`}
      style={{
        width: "100%",
        height: "160px",
        objectFit: "cover",
        borderRadius: "12px"
      }}
    />
  ))}
</div>

            <p>{selectedListing.description}</p>
            <p><MapPin size={16} /> {selectedListing.city}</p>
            <h3>€ {selectedListing.reward_eur}</h3>

            {user && selectedListing.user_id === user.id ? (
              <div>
                <div>
  <button
    className="secondary-btn"
    onClick={() => {
      setTitle(selectedListing.title);
      setDescription(selectedListing.description);
      setCity(selectedListing.city);
      setReward(String(selectedListing.reward_eur));
      setNewCategory(selectedListing.category);
      setSelectedImages([]);
      setEditImageUrls(selectedListing.image_urls ?? []);
      setShowEdit(true);
    }}
  >
    Advertentie bewerken
  </button>

  <button
    className="secondary-btn"
    onClick={deleteListing}
  >
    Opdracht verwijderen
  </button>
</div>
                <h3>Ontvangen aanbiedingen</h3>
                {offers.filter((offer) => offer.listing_id === selectedListing.id).length === 0 ? (
                  <p>Nog geen aanbiedingen.</p>
                ) : (
                  offers
                    .filter((offer) => offer.listing_id === selectedListing.id)
                    .map((offer) => (
                      <div className="offer-card" key={offer.id}>
                        <strong>€ {offer.amount}</strong>
                        <p>{offer.message}</p>
                        <span>{offer.status}</span>
                        {offer.status === "pending" && (
                          <div className="modal-actions">
                            <button className="primary-btn" onClick={() => updateOfferStatus(offer, "accepted")}>
                              <Check size={16} /> Accepteren
                            </button>
                            <button className="secondary-btn" onClick={() => updateOfferStatus(offer, "rejected")}>
                              Afwijzen
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            ) : (
              <button className="primary-btn full-btn" onClick={() => {
                if (!user) setShowLogin(true);
                else setShowOffer(true);
              }}>
                Bied aan
              </button>
            )}

            {showOffer && (
              <div className="form-fields">
                <h3>Jouw aanbod</h3>
                <label>Bedrag in euro</label>
                <input type="number" value={offerAmount} onChange={(event) => setOfferAmount(event.target.value)} />
                <label>Bericht</label>
                <textarea value={offerMessage} onChange={(event) => setOfferMessage(event.target.value)} />
                <button className="primary-btn full-btn" onClick={submitOffer}>Aanbod versturen</button>
              </div>
            )}

            {user && offers.some((offer) => offer.listing_id === selectedListing.id && offer.status === "accepted") && (
              <div className="chat-area">
                <h3><MessageCircle size={18} /> Berichten</h3>
                {messages.filter((message) => message.listing_id === selectedListing.id).map((message) => (
                  <div className="chat-message" key={message.id}>
                    <small>{message.sender_id === user.id ? "Jij" : "Andere gebruiker"}</small>
                    <p>{message.body}</p>
                  </div>
                ))}
                <textarea value={chatText} onChange={(event) => setChatText(event.target.value)} placeholder="Schrijf een bericht..." />
                <button className="primary-btn full-btn" onClick={sendMessage}>
                  <Send size={16} /> Verstuur
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
            
    {showNotifications && user && (
  <div className="modal-backdrop" onClick={() => setShowNotifications(false)}>
    <div className="modal" onClick={(event) => event.stopPropagation()}>
      <button className="close-btn" onClick={() => setShowNotifications(false)}>
        <X />
      </button>
      <h2><Bell /> Meldingen</h2>
      {notifications.length === 0 ? (
        <p>Je hebt nog geen meldingen.</p>
      ) : (
        notifications.map((n) => (
          <div className="offer-card" key={n.id}>
            <p>{n.message}</p>
            <small>{new Date(n.created_at).toLocaleString("nl-BE")}</small>
          </div>
        ))
      )}
    </div>
  </div>
)}
      {showInbox && user && (
  <div className="modal-backdrop" onClick={() => setShowInbox(false)}>
    <div className="modal" onClick={(event) => event.stopPropagation()}>
      <button className="close-btn" onClick={() => setShowInbox(false)}>
        <X />
      </button>

      <h2><MessageCircle /> Berichten</h2>

   {Array.from(
  new Set(
    messages
      .filter((message) =>
        message.sender_id === user.id || message.receiver_id === user.id
      )
      .map((message) => {
  const otherId =
    message.sender_id === user.id
      ? message.receiver_id
      : message.sender_id;

  return `${otherId}|||${message.listing_id}`;
})
      
      )
  )
.map((chatKey) => {
  const [otherId, listingId] = chatKey.split("|||");
  const conversation = messages
  .filter(
    (message) =>
      message.listing_id === listingId &&
      (
        (message.sender_id === user.id && message.receiver_id === otherId) ||
        (message.sender_id === otherId && message.receiver_id === user.id)
      )
  )
    
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() -
        new Date(b.created_at).getTime()
    );

  const lastMessage = conversation[conversation.length - 1];
  const otherProfile = allProfiles.find(
    (item) => item.user_id === otherId
  );

  const listing = listings.find(
    (item) => item.id === lastMessage?.listing_id
  );

     return (
    <div
      className="offer-card"
      key={chatKey}
      style={{ marginBottom: "12px", cursor: "pointer" }}
      onClick={() => {
        setSelectedChatUserId(otherId);
        setSelectedListing(listing || null);
        setShowInbox(false);
        setShowChat(true);
      }}
    >
      <strong>{otherProfile?.display_name || "Gebruiker"}</strong> 
      <small>{listing?.title || "Advertentie"}</small>
    </div>
  );
})}

{messages.filter(
  (message) =>
    message.sender_id === user.id || message.receiver_id === user.id
).length === 0 && <p>Je hebt nog geen berichten.</p>}
    </div>
  </div>
)}  
      {showChat && user && selectedChatUserId && (
  <div className="modal-backdrop" onClick={() => setShowChat(false)}>
    <div className="modal" onClick={(event) => event.stopPropagation()}>
      <button className="close-btn" onClick={() => setShowChat(false)}>
        <X />
      </button>

      <h2>
        {allProfiles.find(
          (item) => item.user_id === selectedChatUserId
        )?.display_name || "Gebruiker"}
      </h2>

      <div style={{ maxHeight: "400px", overflowY: "auto" }}>
        {messages
          .filter(
            (message) =>
              message.listing_id === selectedListing?.id &&
              (message.sender_id === user.id &&
                message.receiver_id === selectedChatUserId) ||
              (message.sender_id === selectedChatUserId &&
                message.receiver_id === user.id)
          )
          .map((message) => (
            <div
              key={message.id}
              style={{
                textAlign: message.sender_id === user.id ? "right" : "left",
                margin: "10px 0",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "10px",
                  borderRadius: "12px",
                  background:
                    message.sender_id === user.id ? "#d9fdd3" : "#eeeeee",
                  maxWidth: "80%",
                }}
              >
                <p>{message.body}</p>
                <small>
                  {new Date(message.created_at).toLocaleString("nl-BE")}
                </small>
              </div>
            </div>
          ))}
      </div>

      <textarea
        value={chatText}
        onChange={(event) => setChatText(event.target.value)}
        placeholder="Schrijf een bericht..."
      />

      <button className="primary-btn full-btn" onClick={sendMessage}>
        <Send size={16} /> Verstuur
      </button>
    </div>
  </div>
)}
      {showLogin && (
        <div className="modal-backdrop" onClick={() => setShowLogin(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowLogin(false)}><X /></button>
            <h2>{isSignup ? "Account aanmaken" : "Welkom terug"}</h2>
            {isSignup && (
              <>
                <label>Naam</label>
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Je naam" />
              </>
            )}
            <label>E-mailadres</label>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="naam@email.com" />
            <label>Wachtwoord</label>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Wachtwoord" />
            <button className="primary-btn full-btn" onClick={handleAuth}>
              {isSignup ? "Registreren" : "Inloggen"}
            </button>
            <button className="text-btn" onClick={() => setIsSignup(!isSignup)}>
              {isSignup ? "Ik heb al een account" : "Nog geen account? Registreren"}
            </button>
          </div>
        </div>
      )}

      {enlargedImage && (
        <div
          onTouchStart={(event) => {
            if (event.touches.length === 1) {
              touchStartX.current = event.touches[0].clientX;
            }
          }}
          onTouchMove={(event) => {
            event.preventDefault();
          }}
          onTouchEnd={(event) => {
            if (touchStartX.current === null) return;

            const delta =
              event.changedTouches[0].clientX - touchStartX.current;

            touchStartX.current = null;

            if (Math.abs(delta) < 35) return;

            const images = selectedListing?.image_urls ?? [];
            const index = images.indexOf(enlargedImage);

            if (delta < 0 && index < images.length - 1) {
              setEnlargedImage(images[index + 1]);
            } else if (delta > 0 && index > 0) {
              setEnlargedImage(images[index - 1]);
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 20000,
            background: "rgba(0,0,0,0.96)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            touchAction: "none",
            overscrollBehavior: "contain"
          }}
        >
          <button
            onClick={() => setEnlargedImage(null)}
            style={{
              position: "absolute",
              top: "15px",
              right: "20px",
              zIndex: 5,
              fontSize: "32px",
              color: "white",
              background: "#333",
              border: "1px solid white",
              borderRadius: "50%",
              width: "48px",
              height: "48px"
            }}
          >
            ×
          </button>

          

          <img
            src={enlargedImage}
            alt="Foto"
            draggable={false}
            style={{
              maxWidth: "85%",
              maxHeight: "82vh",
              objectFit: "contain",
              userSelect: "none",
              pointerEvents: "none"
            }}
          />

          

          <div
            style={{
              position: "absolute",
              bottom: "20px",
              color: "white",
              fontSize: "16px",
              background: "#333",
              padding: "6px 12px",
              borderRadius: "20px"
            }}
          >
            {(selectedListing?.image_urls ?? []).indexOf(enlargedImage) + 1}
            {" / "}
            {(selectedListing?.image_urls ?? []).length}
          </div>
        </div>
      )}
      
         {showCreate && (
        <div className="modal-backdrop" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowCreate(false)}><X /></button>
            <h2>Nieuwe opdracht plaatsen</h2>

            <label>Titel</label>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Wat moet er gebeuren?" />

            <label>Beschrijving</label>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Geef meer informatie..." />

            <label>Categorie</label>
            <select value={newCategory} onChange={(event) => setNewCategory(event.target.value)}>
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>

            <label>Stad</label>
            <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Bijvoorbeeld Antwerpen" />

            <label>Beloning in euro</label>
            <input type="number" value={reward} onChange={(event) => setReward(event.target.value)} placeholder="50" />

            <label>Foto's toevoegen (maximaal 5)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => {
                setSelectedImages(Array.from(event.target.files ?? []).slice(0, 5));
              }}
            />

            <button className="primary-btn full-btn" onClick={createListing}>
              Opdracht plaatsen
            </button>
          </div>
        </div>
      )}
{showEdit && selectedListing && (
  <div className="modal-backdrop" onClick={() => setShowEdit(false)}>
    <div className="modal" onClick={(event) => event.stopPropagation()}>
      <button className="close-btn" onClick={() => setShowEdit(false)}>
        <X />
      </button>

      <h2>Advertentie bewerken</h2>

      <label>Titel</label>
      <input value={title} onChange={(event) => setTitle(event.target.value)} />

      <label>Beschrijving</label>
      <textarea value={description} onChange={(event) => setDescription(event.target.value)} />

      <label>Categorie</label>
      <select value={newCategory} onChange={(event) => setNewCategory(event.target.value)}>
        {categories.map((item) => <option key={item}>{item}</option>)}
      </select>

      <label>Stad</label>
      <input value={city} onChange={(event) => setCity(event.target.value)} />

      <label>Beloning in euro</label>
      <input type="number" value={reward} onChange={(event) => setReward(event.target.value)} />
<div>
  <p>Huidige foto's: {editImageUrls.length}</p>

  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
    {editImageUrls.map((url, index) => (
      <div key={url} style={{ width: "110px" }}>
        <img
          src={url}
          alt={`Foto ${index + 1}`}
          style={{ width: "100px", height: "85px", objectFit: "cover", borderRadius: "8px" }}
        />

        <button type="button" onClick={() => setEditImageUrls(editImageUrls.filter((_, i) => i !== index))}>
          Verwijderen
        </button>

        <button
          type="button"
          disabled={index === 0}
          onClick={() => {
            const next = [...editImageUrls];
            [next[index - 1], next[index]] = [next[index], next[index - 1]];
            setEditImageUrls(next);
          }}
        >
          ←
        </button>

        <button
          type="button"
          disabled={index === editImageUrls.length - 1}
          onClick={() => {
            const next = [...editImageUrls];
            [next[index + 1], next[index]] = [next[index], next[index + 1]];
            setEditImageUrls(next);
          }}
        >
          →
        </button>
      </div>
    ))}
  </div>
</div>
      <label>Nieuwe foto's toevoegen (maximaal 5 in totaal)</label>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          const remaining = Math.max(0, 5 - editImageUrls.length);
          if (files.length > remaining) {
            setNotice(`Je kunt nog maximaal ${remaining} foto's toevoegen.`);
          }
          setSelectedImages(files.slice(0, remaining));
        }}
      />

      <button className="primary-btn full-btn" onClick={updateListing}>
        Wijzigingen opslaan
      </button>
    </div>
  </div>
  
)}
      <button
  onClick={() => user ? setShowInbox(true) : setShowLogin(true)}
  style={{
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "#16a34a",
    color: "white",
    border: "none",
    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer"
  }}
>
  <MessageCircle size={28} />
</button>
      <footer className="footer">
        <a href="#" className="logo"><Recycle size={22} /> Sad Rad</a>
        <p>Geef spullen en hulp een tweede kans.</p>
        <span>© {new Date().getFullYear()} Sad Rad</span>
      </footer>
    </main>
  );
}   

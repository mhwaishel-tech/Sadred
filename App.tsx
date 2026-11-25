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
  User, Bell, EllipsisVertical,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "./supabase";

type Listing = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  postcode?: string | null;
  from_city?: string | null;
  from_postcode?: string | null;
  from_street?: string | null;
  to_city?: string | null;
  to_postcode?: string | null;
  to_street?: string | null;
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
    street: string | null;
  postcode: string | null;
  phone: string | null;
  role: string;
  notifications_enabled: boolean | null;
};

type ChatMessage = {
  id: string;
  listing_id: string;
  sender_id: string;
  receiver_id: string;
  body: string;
  created_at: string;
  is_read: boolean;
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
  const [reviews, setReviews] = useState<any[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
const [showMyListings, setShowMyListings] = useState(false);
const [showMyReviews, setShowMyReviews] = useState(false);
const [showSettings, setShowSettings] = useState(false);
const [settingsSection, setSettingsSection] = useState<"profile" | "notifications" | "password" | null>(null);
  const [settingsName, setSettingsName] = useState("");
const [settingsCity, setSettingsCity] = useState("");
const [settingsPhone, setSettingsPhone] = useState("");
  const [settingsStreet, setSettingsStreet] = useState("");
const [settingsPostcode, setSettingsPostcode] = useState("");
const [newPassword, setNewPassword] = useState("");
const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
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
  const [chatSearch, setChatSearch] = useState("");
  const [email, setEmail] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [listingPostcode, setListingPostcode] = useState("");
  const [fromCity, setFromCity] = useState("");
  const [fromPostcode, setFromPostcode] = useState("");
  const [fromStreet, setFromStreet] = useState("");
  const [toCity, setToCity] = useState("");
  const [toPostcode, setToPostcode] = useState("");
  const [toStreet, setToStreet] = useState("");
  const [reward, setReward] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [editImageUrls, setEditImageUrls] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState(categories[0]);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [chatText, setChatText] = useState("");
  const [notice, setNotice] = useState("");
useEffect(() => {
  if (!notice) return;

  const timer = setTimeout(() => {
    setNotice("");
  }, 3000);

  return () => clearTimeout(timer);
}, [notice]);
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
    if (!user?.id) return;

    (window as any).OneSignalDeferred =
      (window as any).OneSignalDeferred || [];

    (window as any).OneSignalDeferred.push(
      async (OneSignal: any) => {
        await OneSignal.login(user.id);
      }
    );
  }, [user?.id]);
  useEffect(() => {
    loadData();
  }, [user]);
useEffect(() => {
  const client = supabase;
if (!client || !user) return;
  const channel = client
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
        loadData();
      }
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
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
      setSettingsStreet(profileData?.street ?? "");
      
setSettingsPostcode(profileData?.postcode ?? "");
      setSettingsName(profileData?.display_name ?? "");
setSettingsCity(profileData?.city ?? "");
setSettingsPhone(profileData?.phone ?? "");
      setNotificationsEnabled(profileData?.notifications_enabled ?? true);
      const { data: profilesData } = await supabase
  .from("profiles")
  .select("*");

setAllProfiles((profilesData ?? []) as Profile[]);

      const { data: offerData } = await supabase
        .from("offers")
        .select("*");

      setOffers((offerData ?? []) as Offer[]);
      const { data: reviewData } = await supabase
  .from("reviews")
  .select("*")
  .eq("reviewee_id", user.id)
  .order("created_at", { ascending: false });

setReviews(reviewData ?? []);

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
  if (authLoading) return;

  if (!supabase) {
    setNotice("Serververbinding ontbreekt. Controleer de Supabase-instellingen.");
    return;
  }

  if (!email.trim() || !password) {
    setNotice("Vul je e-mailadres en wachtwoord in.");
    return;
  }

  setAuthLoading(true);

  try {
    if (isSignup) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        setNotice(error.message);
        return;
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            user_id: data.user.id,
            display_name: name,
            role: "both",
          });

        if (profileError) {
          setNotice(profileError.message);
          return;
        }
      }

      setNotice("Account aangemaakt. Controleer je e-mail indien nodig.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
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
  } catch (error) {
    setNotice(
      error instanceof Error
        ? error.message
        : "Er is een onverwachte fout opgetreden."
    );
    } finally {
    setAuthLoading(false);
  }
}

async function handleLogout() {
  if (!supabase) return;

  await supabase.auth.signOut();
  setNotice("Je bent uitgelogd.");
}
  
async function changePassword() {
  if (!supabase || !user || !user.email) return;

  if (!currentPassword.trim() || !newPassword.trim()) {
    setNotice("Vul beide wachtwoordvelden in.");
    return;
  }

  if (newPassword.length < 6) {
    setNotice("Het nieuwe wachtwoord moet minimaal 6 tekens bevatten.");
    return;
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (verifyError) {
    setNotice("Het huidige wachtwoord is onjuist.");
    return;
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    setNotice(error.message);
    return;
  }

  setCurrentPassword("");
  setNewPassword("");
  setNotice("Je wachtwoord is gewijzigd.");
}
  
  async function createListing() {
    if (!supabase || !user) {
      setShowLogin(true);
      return;
    }

    const isMoving = newCategory === "Verhuizen";
    if (!title.trim() || !reward || (isMoving
      ? !fromCity.trim() || !fromPostcode.trim() || !fromStreet.trim() || !toCity.trim() || !toPostcode.trim() || !toStreet.trim()
      : !city.trim())) {
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
      city: isMoving ? toCity.trim() : city.trim(),
      postcode: isMoving ? toPostcode.trim() : listingPostcode.trim(),
      ...(isMoving ? { from_city: fromCity.trim(), from_postcode: fromPostcode.trim(), from_street: fromStreet.trim(), to_city: toCity.trim(), to_postcode: toPostcode.trim(), to_street: toStreet.trim() } : {}),
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
    setListingPostcode("");
    setFromCity(""); setFromPostcode(""); setFromStreet("");
    setToCity(""); setToPostcode(""); setToStreet("");
    setReward("");
    setSelectedImages([]);
    setShowCreate(false);
    setNotice("Je opdracht is geplaatst.");
    await loadData();
  }
  async function saveSettings() {
  if (!supabase || !user) return;

  const { error } = await supabase
    .from("profiles")
    .upsert({
      user_id: user.id,
      display_name: settingsName,
      city: settingsCity,
      street: settingsStreet,
      postcode: settingsPostcode,
      phone: settingsPhone,
      notifications_enabled: notificationsEnabled,
    });

  if (error) {
    setNotice(error.message);
    return;
  }

  setNotice("Instellingen opgeslagen.");
  await loadData();
}
    async function updateListing() {
    if (!supabase || !user || !selectedListing) return;

    if (selectedListing.user_id !== user.id) {
      

      
      setNotice("Je mag deze opdracht niet bewerken.");
      return;
    }

    const isMoving = newCategory === "Verhuizen";
    if (!title.trim() || !reward || (isMoving
      ? !fromCity.trim() || !fromPostcode.trim() || !fromStreet.trim() || !toCity.trim() || !toPostcode.trim() || !toStreet.trim()
      : !city.trim())) {
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
        city: isMoving ? toCity.trim() : city.trim(),
        postcode: isMoving ? toPostcode.trim() : listingPostcode.trim(),
        from_city: isMoving ? fromCity.trim() : null,
        from_postcode: isMoving ? fromPostcode.trim() : null,
        from_street: isMoving ? fromStreet.trim() : null,
        to_city: isMoving ? toCity.trim() : null,
        to_postcode: isMoving ? toPostcode.trim() : null,
        to_street: isMoving ? toStreet.trim() : null,
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
  postcode: listingPostcode.trim(),
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
const { error: notificationError } = await supabase
  .from("notifications")
  .insert({
    user_id: selectedListing.user_id,
    title: "Nieuw aanbod",
    listing_id: selectedListing.id,
    type: "offer",
    message: "Je hebt een nieuw aanbod ontvangen.",
  });

if (notificationError) {
  setNotice("Notification error: " + notificationError.message);
  return;
}
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

    if (status === "accepted") {
      const { error: messageError } = await supabase.from("messages").insert({
        listing_id: offer.listing_id,
        sender_id: user.id,
        receiver_id: offer.user_id,
        body: "Je aanbod is geaccepteerd. We kunnen hier verder chatten.",
      });

      if (messageError) {
        setNotice("Aanbod geaccepteerd, maar het gesprek kon niet worden gestart: " + messageError.message);
        await loadData();
        return;
      }
    }

    setNotice(
      status === "accepted"
        ? "Aanbod geaccepteerd. Het gesprek staat nu bij Berichten."
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

setChatText("");
await loadData();
setNotice("Bericht verzonden.");
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

  // Keep top-level sections mutually exclusive so dialogs never stack.
  function closeNavigationViews() {
    setShowNotifications(false);
    setShowInbox(false);
    setShowChat(false);
    setShowMenu(false);
    setShowMyListings(false);
    setShowMyReviews(false);
    setShowSettings(false);
    setShowCreate(false);
    setShowEdit(false);
    setShowOffer(false);
    setSelectedListing(null);
  }

  function openListing(listing: Listing) {
    closeNavigationViews();
    setSelectedListing(listing);
  }

  function closeDetails() {
    setSelectedListing(null);
    setShowOffer(false);
    setShowChat(false);
  }
    return (
    <main className="app">
      <header className="header">
        <nav>
          <a href="#opdrachten">Opdrachten</a>
          <a href="#hoe-werkt-het">Hoe werkt het?</a>
        </nav>

<div style={{
  position: "fixed",
  right: "16px",
  top: "8px",
  display: "flex",
  flexDirection: "row",
  gap: "12px",
  zIndex: 9999
}}>
  <button
    className="secondary-btn"
    aria-label="Berichten"
    title="Berichten"
    onClick={() => {
      if (!user) {
        setShowLogin(true);
        return;
      }
      closeNavigationViews();
      setShowInbox(true);
    }}
    style={{ width: "44px", height: "44px", borderRadius: "50%", position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,.16)", color: "#000", border: "1px solid rgba(255,255,255,.45)" }}>
    <MessageCircle size={22} strokeWidth={2.4} style={{ width: "22px", height: "22px", minWidth: "22px", minHeight: "22px", display: "block" }} />
    {user && messages.filter((m) => m.receiver_id === user.id && !m.is_read).length > 0 && (
      <span style={{
  position: "absolute",
  top: "-7px",
  right: "-7px",
  background: "red",
  color: "white",
  borderRadius: "50%",
  minWidth: "20px",
  height: "20px",
  padding: "0 5px",
  fontSize: "12px",
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
}}>
  {messages.filter((m) => m.receiver_id === user.id && !m.is_read).length}
</span>
      )}
  </button>

  <button
    className="secondary-btn"
    aria-label="Meldingen"
    title="Meldingen"
    onClick={() => {
      if (!user) return;
      closeNavigationViews();
      setShowNotifications(true);
    }}
style={{ width: "44px", height: "44px", minWidth: "44px", padding: 0, borderRadius: "50%", position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,.16)", color: "#fff", border: "1px solid rgba(255,255,255,.45)" }}>
    <Bell size={22} strokeWidth={2.4} style={{ width: "22px", height: "22px", minWidth: "22px", minHeight: "22px", display: "block" }} />
    {notifications.filter((n) => !n.is_read).length > 0 && (
      <span style={{
  position: "absolute",
  top: "-7px",
  right: "-7px",
  background: "red",
  color: "white",
  borderRadius: "50%",
  minWidth: "20px",
  height: "20px",
  padding: "0 5px",
  fontSize: "12px",
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
}}>
  {notifications.filter((n) => !n.is_read).length}
</span>
  )}
  </button>
</div>

<button
  style={{
  position: "fixed",
  top: "0",
  left: "0",
  margin: "0",
  padding: "8px",
  background: "transparent",
  border: "none",
  boxShadow: "none",
  zIndex: 10000
}}
  onClick={() => {
    if (!showMenu) closeNavigationViews();
    setShowMenu(!showMenu);
  }}
  aria-label="Menu"
  
>
  <EllipsisVertical size={22} />
</button>
        
        {showMenu && (
  <div className="menu-dropdown">
    
    <button onClick={() => { closeNavigationViews(); setShowMyListings(true); }}>
      Mijn opdrachten
    </button>
    <button onClick={() => { closeNavigationViews(); setShowMyReviews(true); }}>
      Mijn beoordelingen
    </button>
    <button onClick={() => { closeNavigationViews(); setShowSettings(true); }}>
      Instellingen
    </button>
<button onClick={async () => {
  setShowMenu(false);
  setNotice("Bezig met meldingen...");
  const OneSignal =
    (window as any).OneSignal ||
    (window as any).__sadRadOneSignal;

  if (!OneSignal) {
    setNotice("OneSignal is niet beschikbaar. Vernieuw de pagina.");
    return;
  }

  try {
    await OneSignal.User.PushSubscription.optIn();
setNotice("Meldingen zijn ingeschakeld.");
  } catch (error: any) {
    setNotice("Fout bij meldingen: " + (error?.message || String(error)));
  }

}}>
  Schakel meldingen in
</button>
    {user ? (
  <button onClick={() => { setShowMenu(false); handleLogout(); }}>
    <LogOut size={17} /> Uitloggen
  </button>
) : (
  <button onClick={() => { setShowMenu(false); setShowLogin(true); }}>
    <LogIn size={17} /> Inloggen
  </button>
)}
  </div>
)}
        
      </header>


      
      {notice && (
        <div className="notice">
          {notice}
          
        </div>
      )}

      <section className="hero">
        <div className="hero-content">
          <div className="hero-brand"><Recycle size={34} /> <span>SDRD</span></div>
          <div className="eyebrow">SAMEN MAKEN WE RUIMTE</div>
          <h1>Een klus gedaan.<br />Een ander geholpen.</h1>
          <p>
            Plaats je klus, ontvang aanbiedingen en vind iemand die je kan
            helpen.
          </p>
          <button
            className="primary-btn"
            onClick={() => {
              if (!user) {
                setShowLogin(true);
                return;
              }
              closeNavigationViews();
              setShowCreate(true);
            }}
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
            {selectedListing.category === "Verhuizen" ? (
              <div className="moving-route-details">
                <p><strong>Van:</strong> {selectedListing.from_street}, {selectedListing.from_postcode} {selectedListing.from_city}</p>
                <p><strong>Naar:</strong> {selectedListing.to_street}, {selectedListing.to_postcode} {selectedListing.to_city}</p>
              </div>
            ) : (
              <p><MapPin size={16} /> {selectedListing.city}</p>
            )}
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
      setListingPostcode(selectedListing.postcode ?? "");
      setFromCity(selectedListing.from_city ?? ""); setFromPostcode(selectedListing.from_postcode ?? ""); setFromStreet(selectedListing.from_street ?? "");
      setToCity(selectedListing.to_city ?? ""); setToPostcode(selectedListing.to_postcode ?? ""); setToStreet(selectedListing.to_street ?? "");
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
      
      {notifications.map((n) => (
  <div
    className="offer-card"
    key={n.id}
    style={{ cursor: "pointer" }}
    onClick={async () => {
  if (!supabase || !user) return;

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", n.id)
    .eq("user_id", user.id);

  if (error) {
    setNotice("خطأ في حفظ القراءة: " + error.message);
    return;
  }

  setNotifications((previous) =>
    previous.map((item) =>
      item.id === n.id ? { ...item, is_read: true } : item
    )
  );

  const listing = listings.find((l) => l.id === n.listing_id);

  if (listing) {
    openListing(listing);
    setShowNotifications(false);
  } else {
    setNotice("De advertentie is niet meer beschikbaar.");
  }
}}
  >
    <p>{n.message}</p>
    <small>{new Date(n.created_at).toLocaleString("nl-BE")}</small>
  </div>
))}
    </div>
  </div>
)}
      {showInbox && user && (
        <div className="modal-backdrop" onClick={() => setShowInbox(false)}>
          <div
            className="modal"
            onClick={(event) => event.stopPropagation()}
            style={{ maxWidth: "520px", width: "95%" }}
          >
            <button className="close-btn" onClick={() => setShowInbox(false)}>
              <X />
            </button>

            <h2><MessageCircle /> Berichten</h2>

            <input
              type="text"
              value={chatSearch}
              onChange={(event) => setChatSearch(event.target.value)}
              placeholder="Zoek gesprekken..."
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                marginBottom: "16px",
                boxSizing: "border-box"
              }}
            />

            {Array.from(
              new Set(
                messages
                  .filter((message) =>
                    message.sender_id === user.id ||
                    message.receiver_id === user.id
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
                        (message.sender_id === user.id &&
                          message.receiver_id === otherId) ||
                        (message.sender_id === otherId &&
                          message.receiver_id === user.id)
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
                  (item) => item.id === listingId
                );
                const unreadCount = conversation.filter(
                  (message) =>
                    message.sender_id === otherId &&
                    message.receiver_id === user.id &&
                    !message.is_read
                ).length;

                return {
                  chatKey,
                  otherId,
                  listing,
                  otherProfile,
                  lastMessage,
                  unreadCount
                };
              })
              .filter((chat) => {
                const searchText = chatSearch.trim().toLowerCase();
                return (
                  !searchText ||
                  (chat.otherProfile?.display_name || "Gebruiker")
                    .toLowerCase().includes(searchText) ||
                  (chat.listing?.title || "").toLowerCase().includes(searchText) ||
                  (chat.lastMessage?.body || "").toLowerCase().includes(searchText)
                );
              })
              .sort(
                (a, b) =>
                  new Date(b.lastMessage?.created_at || 0).getTime() -
                  new Date(a.lastMessage?.created_at || 0).getTime()
              )
              .map((chat) => (
                <div
                  key={chat.chatKey}
                  onClick={async () => {
                    setSelectedChatUserId(chat.otherId);
                    setSelectedListing(chat.listing || null);
                    setShowInbox(false);
                    setShowChat(true);

                    if (chat.listing) {
                      await supabase
                        ?.from("messages")
                        .update({ is_read: true })
                        .eq("listing_id", chat.listing.id)
                        .eq("sender_id", chat.otherId)
                        .eq("receiver_id", user.id);

                      setMessages((previous) =>
                        previous.map((message) =>
                          message.listing_id === chat.listing?.id &&
                          message.sender_id === chat.otherId &&
                          message.receiver_id === user.id
                            ? { ...message, is_read: true }
                            : message
                        )
                      );
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "13px 8px",
                    borderBottom: "1px solid #e5e7eb",
                    cursor: "pointer"
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      minWidth: "48px",
                      borderRadius: "50%",
                      background: "#e0f2e5",
                      color: "#247a42",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "19px",
                      fontWeight: "bold"
                    }}
                  >
                    {(chat.otherProfile?.display_name || "G")
                      .trim()
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong>
                      {chat.otherProfile?.display_name || "Gebruiker"}
                    </strong>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#247a42",
                        marginTop: "3px"
                      }}
                    >
                      {chat.listing?.title || "Advertentie"}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#777",
                        marginTop: "4px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {chat.lastMessage?.sender_id === user.id ? "Jij: " : ""}
                      {chat.lastMessage?.body || "Geen berichten"}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "7px"
                    }}
                  >
                    <small style={{ color: "#888", whiteSpace: "nowrap" }}>
                      {chat.lastMessage
                        ? new Date(chat.lastMessage.created_at).toLocaleTimeString(
                            "nl-BE",
                            { hour: "2-digit", minute: "2-digit" }
                          )
                        : ""}
                    </small>
                    {chat.unreadCount > 0 && (
                      <span
                        style={{
                          background: "#e53935",
                          color: "white",
                          borderRadius: "50%",
                          minWidth: "21px",
                          height: "21px",
                          padding: "0 5px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: "bold"
                        }}
                      >
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))}

            {messages.filter(
              (message) =>
                message.sender_id === user.id ||
                message.receiver_id === user.id
            ).length === 0 && <p>Je hebt nog geen berichten.</p>}
          </div>
        </div>
      )}

      {showChat && user && selectedChatUserId && (
        <div className="modal-backdrop" onClick={() => setShowChat(false)}>
          <div
            className="modal"
            onClick={(event) => event.stopPropagation()}
            style={{ maxWidth: "520px", width: "95%" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                borderBottom: "1px solid #e5e7eb",
                paddingBottom: "12px",
                marginBottom: "15px"
              }}
            >
              <button
                className="close-btn"
                onClick={() => setShowChat(false)}
              >
                <X />
              </button>

              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  background: "#e0f2e5",
                  color: "#247a42",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold"
                }}
              >
                {(allProfiles.find(
                  (item) => item.user_id === selectedChatUserId
                )?.display_name || "G")
                  .trim()
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div style={{ flex: 1 }}>
                <strong>
                  {allProfiles.find(
                    (item) => item.user_id === selectedChatUserId
                  )?.display_name || "Gebruiker"}
                </strong>
                <div style={{ fontSize: "12px", color: "#777" }}>
                  {selectedListing?.title || "Advertentie"}
                </div>
              </div>
            </div>

            <div
              style={{
                maxHeight: "400px",
                minHeight: "220px",
                overflowY: "auto",
                padding: "10px",
                background: "#f7f8f7",
                borderRadius: "12px"
              }}
            >
              {messages
                .filter(
                  (message) =>
                    message.listing_id === selectedListing?.id &&
                    (
                      (message.sender_id === user.id &&
                        message.receiver_id === selectedChatUserId) ||
                      (message.sender_id === selectedChatUserId &&
                        message.receiver_id === user.id)
                    )
                )
                .sort(
                  (a, b) =>
                    new Date(a.created_at).getTime() -
                    new Date(b.created_at).getTime()
                )
                .map((message) => (
                  <div
                    key={message.id}
                    style={{
                      display: "flex",
                      justifyContent:
                        message.sender_id === user.id
                          ? "flex-end"
                          : "flex-start",
                      margin: "9px 0"
                    }}
                  >
                    <div
                      style={{
                        padding: "10px 13px",
                        borderRadius: "14px",
                        background:
                          message.sender_id === user.id
                            ? "#d9fdd3"
                            : "#ffffff",
                        maxWidth: "82%",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.08)"
                      }}
                    >
                      <p style={{ margin: "0 0 5px", overflowWrap: "anywhere" }}>
                        {message.body}
                      </p>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "#777",
                          textAlign: "right"
                        }}
                      >
                        {new Date(message.created_at).toLocaleTimeString(
                          "nl-BE",
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                        {message.sender_id === user.id && (message.is_read ? " ✓✓" : " ✓")}
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <textarea
              value={chatText}
              onChange={(event) => setChatText(event.target.value)}
              placeholder="Schrijf een bericht..."
              style={{
                width: "100%",
                marginTop: "12px",
                boxSizing: "border-box",
                borderRadius: "12px"
              }}
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
            
            <button
  className="primary-btn full-btn"
  onClick={handleAuth}
  disabled={authLoading}
>
  {authLoading
    ? "Even geduld..."
    : isSignup
      ? "Registreren"
      : "Inloggen"}
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

            {newCategory === "Verhuizen" ? (
              <>
                <h3>Van (ophaaladres)</h3>
                <label>Stad</label>
                <input value={fromCity} onChange={(event) => setFromCity(event.target.value)} placeholder="Bijvoorbeeld Antwerpen" />
                <label>Postcode</label>
                <input value={fromPostcode} onChange={(event) => setFromPostcode(event.target.value)} placeholder="Bijvoorbeeld 2170" />
                <label>Straat en huisnummer</label>
                <input value={fromStreet} onChange={(event) => setFromStreet(event.target.value)} placeholder="Straatnaam en huisnummer" />
                <h3>Naar (afleveradres)</h3>
                <label>Stad</label>
                <input value={toCity} onChange={(event) => setToCity(event.target.value)} placeholder="Bijvoorbeeld Antwerpen" />
                <label>Postcode</label>
                <input value={toPostcode} onChange={(event) => setToPostcode(event.target.value)} placeholder="Bijvoorbeeld 2000" />
                <label>Straat en huisnummer</label>
                <input value={toStreet} onChange={(event) => setToStreet(event.target.value)} placeholder="Straatnaam en huisnummer" />
              </>
            ) : (
              <>
                <label>Stad</label>
                <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Bijvoorbeeld Antwerpen" />
                <label>Postcode</label>
                <input value={listingPostcode} onChange={(event) => setListingPostcode(event.target.value)} placeholder="Bijvoorbeeld 2170" />
              </>
            )}

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
  
      {showMyListings && (
  <div className="modal-backdrop" onClick={() => setShowMyListings(false)}>
    <div className="modal" onClick={(event) => event.stopPropagation()}>
      <button className="close-btn" onClick={() => setShowMyListings(false)}>
        <X />
      </button>

      <h2>Mijn opdrachten</h2>

      {listings.filter((item) => item.user_id === user?.id).length === 0 ? (
        <p>Je hebt nog geen opdrachten geplaatst.</p>
      ) : (
        listings
          .filter((item) => item.user_id === user?.id)
          .map((item) => (
            <div key={item.id}>
              <h3>{item.title}</h3>
              <p>{item.city} — €{item.reward_eur}</p>
              <p>Status: {item.status}</p>
            </div>
          ))
      )}
    </div>
  </div>
)}
 {showMyReviews && (
  <div className="modal-backdrop" onClick={() => setShowMyReviews(false)}>
    <div className="modal" onClick={(event) => event.stopPropagation()}>
      <button className="close-btn" onClick={() => setShowMyReviews(false)}>
        <X />
      </button>

      <h2>Mijn beoordelingen</h2>

      {reviews.length === 0 ? (
        <p>Je hebt nog geen beoordelingen ontvangen.</p>
      ) : (
        reviews.map((item) => (
          <div key={item.id}>
            <p>⭐ {item.rating} / 5</p>
            <p>{item.review || item.comment}</p>
            <p>{new Date(item.created_at).toLocaleDateString("nl-BE")}</p>
            <hr />
          </div>
        ))
      )}
    </div>
  </div>
)}     
      
{showSettings && (
  <div className="modal-backdrop" onClick={() => setShowSettings(false)}>
    <div className="modal" onClick={(event) => event.stopPropagation()}>
      <button className="close-btn" onClick={() => setShowSettings(false)}>
        <X />
      </button>

      <h2>Instellingen</h2>

      <button
        type="button"
        className="primary-btn full-btn"
        onClick={() => setSettingsSection(settingsSection === "profile" ? null : "profile")}
      >
        Mijn profiel
      </button>
      {settingsSection === "profile" && (
        <>
          <label>Naam</label>
          <input value={settingsName} onChange={(event) => setSettingsName(event.target.value)} placeholder="Naam" />

          <label>Straat</label>
          <input value={settingsStreet} onChange={(event) => setSettingsStreet(event.target.value)} placeholder="Straat" />

          <label>Stad</label>
          <input value={settingsCity} onChange={(event) => setSettingsCity(event.target.value)} placeholder="Stad" />

          <label>Postcode</label>
          <input value={settingsPostcode} onChange={(event) => setSettingsPostcode(event.target.value)} placeholder="Postcode" />

          <label>Telefoonnummer</label>
          <input type="tel" value={settingsPhone} onChange={(event) => setSettingsPhone(event.target.value)} placeholder="Telefoonnummer" />

          <button className="primary-btn full-btn" onClick={saveSettings}>
            Instellingen opslaan
          </button>
        </>
      )}

      <button
        type="button"
        className="primary-btn full-btn"
        onClick={() => setSettingsSection(settingsSection === "notifications" ? null : "notifications")}
      >
        Meldingen
      </button>
      {settingsSection === "notifications" && (
        <>
          <label>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(event) => setNotificationsEnabled(event.target.checked)}
            />
            Meldingen inschakelen
          </label>
          <button className="primary-btn full-btn" onClick={saveSettings}>
            Instellingen opslaan
          </button>
        </>
      )}

      <button
        type="button"
        className="primary-btn full-btn"
        onClick={() => setSettingsSection(settingsSection === "password" ? null : "password")}
      >
        Wachtwoord wijzigen
      </button>
      {settingsSection === "password" && (
        <>
          <label>Oud wachtwoord</label>
          <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="Oud wachtwoord" />

          <label>Nieuw wachtwoord</label>
          <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Nieuw wachtwoord" />

          <button className="primary-btn full-btn" onClick={changePassword}>
            Wachtwoord wijzigen
          </button>
        </>
      )}
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

      {newCategory === "Verhuizen" ? (
        <>
          <h3>Van (ophaaladres)</h3>
          <label>Stad</label>
          <input value={fromCity} onChange={(event) => setFromCity(event.target.value)} placeholder="Bijvoorbeeld Antwerpen" />
          <label>Postcode</label>
          <input value={fromPostcode} onChange={(event) => setFromPostcode(event.target.value)} placeholder="Bijvoorbeeld 2170" />
          <label>Straat en huisnummer</label>
          <input value={fromStreet} onChange={(event) => setFromStreet(event.target.value)} placeholder="Straatnaam en huisnummer" />
          <h3>Naar (afleveradres)</h3>
          <label>Stad</label>
          <input value={toCity} onChange={(event) => setToCity(event.target.value)} placeholder="Bijvoorbeeld Antwerpen" />
          <label>Postcode</label>
          <input value={toPostcode} onChange={(event) => setToPostcode(event.target.value)} placeholder="Bijvoorbeeld 2000" />
          <label>Straat en huisnummer</label>
          <input value={toStreet} onChange={(event) => setToStreet(event.target.value)} placeholder="Straatnaam en huisnummer" />
        </>
      ) : (
        <>
          <label>Stad</label>
          <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Bijvoorbeeld Antwerpen" />
          <label>Postcode</label>
          <input value={listingPostcode} onChange={(event) => setListingPostcode(event.target.value)} placeholder="Bijvoorbeeld 2170" />
        </>
      )}

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
      
      <footer className="footer">
        <a href="#" className="logo"><Recycle size={22} /> Sad Rad</a>
        <p>Geef spullen en hulp een tweede kans.</p>
        <span>© {new Date().getFullYear()} Sad Rad</span>
      </footer>
    </main>
  );
}   

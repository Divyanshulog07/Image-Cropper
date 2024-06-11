import { useState, useEffect } from "react";
import { openDB } from "idb";
import ImageCropper from "./ImageCropper";

// Open IndexedDB
const dbPromise = openDB("avatar-store", 1, {
  upgrade(db) {
    db.createObjectStore("avatars");
  },
});

const compressImage = (imgSrc, quality = 0.7) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imgSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
  });
};

const Profile = () => {
  const [avatarUrl, setAvatarUrl] = useState("");
  const [fullName, setFullName] = useState("");
  const [profession, setProfession] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [fullNameError, setFullNameError] = useState("");
  const [professionError, setProfessionError] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submittedFullName, setSubmittedFullName] = useState("");
  const [submittedProfession, setSubmittedProfession] = useState("");
  const [uploading, setUploading] = useState(false); // Track avatar uploading state

  useEffect(() => {
    const loadAvatar = async () => {
      const db = await dbPromise;
      const savedAvatarUrl = await db.get("avatars", "avatar");
      if (savedAvatarUrl) setAvatarUrl(savedAvatarUrl);
    };

    loadAvatar();

    const savedFullName = localStorage.getItem("submittedFullName");
    const savedProfession = localStorage.getItem("submittedProfession");

    if (savedFullName) setSubmittedFullName(savedFullName);
    if (savedProfession) setSubmittedProfession(savedProfession);

    if (savedFullName || savedProfession) {
      setFormSubmitted(true);
    }
  }, []);

  const handleFullNameChange = (e) => {
    setFullName(e.target.value);
    setFullNameError(""); // Clear error message when user starts typing
  };

  const handleProfessionChange = (e) => {
    setProfession(e.target.value);
    setProfessionError(""); // Clear error message when user starts typing
  };

  const updateAvatar = async (imgSrc) => {
    setUploading(true); // Set uploading state to true
    try {
      const compressedImgSrc = await compressImage(imgSrc);
      const db = await dbPromise;
      await db.put("avatars", compressedImgSrc, "avatar");
      setAvatarUrl(compressedImgSrc);
      setShowModal(false);
    } catch (error) {
      console.error("Error storing the avatar:", error);
      // Optionally display an error message to the user
    } finally {
      setUploading(false); // Set uploading state to false after upload completion
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let isValid = true;
    if (!fullName) {
      setFullNameError("Full Name is required");
      isValid = false;
    }
    if (!profession) {
      setProfessionError("Profession is required");
      isValid = false;
    }
    if (isValid) {
      // Log form data here
      console.log("Form submitted successfully");
      console.log("Full Name:", fullName);
      console.log("Profession:", profession);
      setFormSubmitted(true); // Set form submission status to true
      setSubmittedFullName(fullName); // Set submitted full name
      setSubmittedProfession(profession); // Set submitted profession

      // Save submitted data to localStorage
      localStorage.setItem("submittedFullName", fullName);
      localStorage.setItem("submittedProfession", profession);

      // Clear the form fields after submission
      setFullName("");
      setProfession("");
    }
  };

  return (
    <>
        <div className="flex justify-center items-center">
          <div>
      <center>
        <img
          src={avatarUrl}
          alt=""
          className="w-[150px] h-[150px] rounded-full border-2 border-gray-400"
        />
        {uploading && (
          <p className="text-green-500 text-sm mt-2">Uploading avatar...</p>
        )}
        {formSubmitted && (
          <>
            <h2 className="text-white font-bold mt-6">{submittedFullName}</h2>
            <p className="text-gray-500 text-sm mt-2">{submittedProfession}</p>
          </>
        )}
      </center>
      <form onSubmit={handleSubmit}>
        <div className="flex gap-10 mb-6 mt-5">
          <div className="">
            <label className="block text-gray-200 text-sm font-bold mb-2">
              Full Name
            </label>
            <input
              className={`text-black shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${
                fullNameError ? "border-red-500" : "border-gray-300"
              }`}
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={handleFullNameChange}
            />
            {fullNameError && (
              <p className="text-red-500 text-xs italic">{fullNameError}</p>
            )}
          </div>
          <div className="">
            <label className="block text-gray-200 text-sm font-bold mb-2">
              Profession
            </label>
            <input
              className={`text-black shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${
                professionError ? "border-red-500" : "border-gray-300"
              }`}
              type="text"
              placeholder="Profession"
              value={profession}
              onChange={handleProfessionChange}
            />
            {professionError && (
              <p className="text-red-500 text-xs italic">{professionError}</p>
            )}
          </div>
        </div>
        {showModal && (
          <ImageCropper
            updateAvatar={updateAvatar}
            closeModal={() => setShowModal(false)}
          />
        )}
        {!showModal && (
          <ImageCropper
            updateAvatar={updateAvatar}
            closeModal={() => setShowModal(true)}
          />
        )}
        <button
          type="submit"
          className="bg-gray-700 hover:bg-gray-600 text-sky-300 rounded-full text-sm border-0 py-2 px-4 mt-2"
        >
          Submit
        </button>
      </form>
      </div>
      </div>
    </>
  );
};

export default Profile;
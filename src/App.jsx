import { useRef, useState, useCallback } from "react";
import Places from "./components/Places.jsx";
import Modal from "./components/Modal.jsx";
import DeleteConfirmation from "./components/DeleteConfirmation.jsx";
import logoImg from "./assets/logo.png";
import AvailablePlaces from "./components/AvailablePlaces.jsx";
import { fetchUserPlaces, updateUserPlaces } from "./http.js";
import Error from "./components/Error.jsx";
import { useEffect } from "react";

function App() {
  const selectedPlace = useRef();

  const [userPlaces, setUserPlaces] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState();

  const [errorUpdatingPlaces, setErrorUpdatingPlaces] = useState();

  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    async function fetchPlaces() {
      setIsFetching(true);
      try {
        const places = await fetchUserPlaces();
        console.log(places);
        setUserPlaces(places);
      } catch (error) {
        setError({
          message: error.message || "Failed to fetch user places",
        });
      } finally {
        setIsFetching(false);
      }
    }

    fetchPlaces();
  }, []);

  function handleStartRemovePlace(place) {
    setModalIsOpen(true);
    selectedPlace.current = place;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  async function handleSelectPlace(selectedPlace) {
    try {
      const updatedPlaces = [selectedPlace, ...userPlaces];
      await updateUserPlaces(updatedPlaces);
      setUserPlaces(updatedPlaces);
    } catch (error) {
      setErrorUpdatingPlaces({
        message:
          error.message || "Could not update places, please try again later",
      });
    }
  }

  const handleRemovePlace = useCallback(
    async function handleRemovePlace() {
      try {
        const updatedPlaces = userPlaces.filter(
          (place) => place.id !== selectedPlace.current.id
        );
        await updateUserPlaces(updatedPlaces);
        setUserPlaces(updatedPlaces);
        setModalIsOpen(false);
      } catch (error) {
        setErrorUpdatingPlaces({
          message: error.message || "Failed to delete a place",
        });
      }
    },
    [userPlaces]
  );

  function handleError() {}

  return (
    <>
      <Modal open={errorUpdatingPlaces} onClose={handleError}>
        {errorUpdatingPlaces && (
          <Error
            title="An error occurred!"
            message={errorUpdatingPlaces.message}
            onConfirm={handleError}
          />
        )}
      </Modal>

      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        {error && <Error title="An error occurred" message={error.message} />}
        {!error && (
          <Places
            title="I'd like to visit ..."
            fallbackText="Select the places you would like to visit below."
            isLoading={isFetching}
            loadingText={"Fetching user places..."}
            places={userPlaces}
            onSelectPlace={handleStartRemovePlace}
          />
        )}

        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}

export default App;

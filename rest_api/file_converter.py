"""Defines utility for doing file conversions."""

import io
import pickle

import cv2
import h5py
import numpy as np
import av


class FileConverter:
    """Utility for doing file conversions."""

    def mp4_to_jpeg(self, input_file):
        """
        Convert input MP4 file to list of JPEGs.

        :param input:   input MP4 file as Flask FileStorage object
        :retrun:        list of JPEG files as byte array
        """
        # Ensure the file pointer is at the start
        input_file.seek(0)

        # Read the MP4 file content into a BytesIO stream
        video_stream = io.BytesIO(input_file.read())

        # Open the video stream using PyAV
        container = av.open(video_stream)
        video_frames = []

        # Process each frame in the video
        for frame in container.decode(video=0):
            # Convert PyAV frame to PIL Image then to NumPy array for cv2 compatibility
            img = frame.to_image()  # Converts frame to PIL Image
            img_array = np.array(img)  # Converts PIL Image to NumPy array

            # Encode the NumPy array as a JPEG
            # pylint: disable=no-member
            # This should be ignored because pylint insists that imencode doesn't exist yet it does.
            is_success, buffer = cv2.imencode(".jpg", img_array)
            if is_success:
                # Convert the buffer (numpy array) to bytes
                frame_bytes = buffer.tobytes()
                video_frames.append(frame_bytes)

        # Return the list of JPEG byte arrays
        return video_frames

    def jpeg_to_pickle(self, input_files):
        """
        Convert a list of jpeg files to a pickle file.

        :param input:   list of input JPEGs as byte arrays
        :retrun:        pickle file as BytesIO
        """
        pickle_buffer = io.BytesIO()
        pickle.dump(input_files, pickle_buffer)
        pickle_buffer.seek(0)

        return pickle_buffer

    def jpeg_to_h5(self, input_files):
        """
        Convert a list of jpeg files to a h5 file.

        :param input:   list of input JPEGs as byte arrays
        :retrun:        h5 file as BytesIO
        """
        hdf5_buffer = io.BytesIO()
        with h5py.File(hdf5_buffer, "w") as hdf5_file:
            dt = h5py.vlen_dtype(np.dtype("uint8"))
            dataset = hdf5_file.create_dataset(
                "jpeg_images", (len(input_files),), dtype=dt
            )
            for i, jpeg_data in enumerate(input_files):
                dataset[i] = np.frombuffer(jpeg_data, dtype="uint8")
        hdf5_buffer.seek(0)

        return hdf5_buffer

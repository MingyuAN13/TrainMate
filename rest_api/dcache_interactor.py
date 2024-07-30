"""
Manages the interactions with dCache
"""

import os
import xml.etree.ElementTree as ET
import requests


class DCacheInteractor:
    """
    Manages the interactions with dCache
    """

    def __init__(self):
        # load the enviroment variables
        self.token = os.environ.get("WEBDAV_TOKEN")
        # set the url for the dcache
        host = os.environ.get("WEBDAV_HOST")
        port = os.environ.get("WEBDAV_PORT")
        self.url = f"{host}:{port}/"

    def get_headers(self):
        """Creates a new header dictionary"""
        # headers for authentication
        return {
            "Authorization": self.token,
        }

    def get_dir_content(self, directory=""):
        """
        Get the content of a specified directory

        :param dir:     The directory to get the contents of
        :return:        A list of file paths
        """
        # expect xml response
        headers = self.get_headers()
        headers["Content-Type"] = "application/xml"
        # make PROPFIND request to get directory structure
        response = requests.request(
            "PROPFIND", self.url + directory, headers=headers, timeout=5
        )
        # parse the xml response
        root = ET.fromstring(response.content)
        namespaces = {"d": "DAV:"}

        # Extract the display name for each element in the directory
        file_paths = []

        # Iterate through each response element
        for response in root.findall("d:response", namespaces):
            href = response.find("d:href", namespaces).text
            # Check if the resource is a file by ensuring resourcetype is not a collection
            resourcetype = response.find("d:propstat/d:prop/d:resourcetype", namespaces)
            if (
                resourcetype is not None
                and resourcetype.find("d:collection", namespaces) is None
            ):
                file_paths.append(href)

        return file_paths

    def get_dir_content_and_subdirs(self, directory=""):
        """Get all the files in a directory reccursively"""
        # expect xml response
        headers = self.get_headers()
        headers["Content-Type"] = "application/xml"
        headers["Depth"] = "1"
        # make PROPFIND request to get directory structure
        response = requests.request(
            "PROPFIND", self.url + directory, headers=headers, timeout=5
        )
        # parse the xml response
        root = ET.fromstring(response.content)
        namespaces = {"d": "DAV:"}

        # Extract the display name for each element in the directory
        file_paths = []
        sub_dirs = []

        # Iterate through each response element
        for response in root.findall("d:response", namespaces):
            href = response.find("d:href", namespaces).text
            # Check if the resource is a file by ensuring resourcetype is not a collection
            resourcetype = response.find("d:propstat/d:prop/d:resourcetype", namespaces)
            if resourcetype is not None:
                if resourcetype.find("d:collection", namespaces) is None:
                    file_paths.append(href)
                elif href[1:] not in directory:
                    sub_dirs.append(href)

        return file_paths, sub_dirs

    def get_dir_content_recursive(self, directory=""):
        """
        Get the content of a specified directory

        :param dir:     The directory to get the contents of
        :return:        A list of file paths
        """

        # Extract the display name for each element in the directory
        file_paths, sub_dirs = self.get_dir_content_and_subdirs(directory=directory)

        while len(sub_dirs) > 0:
            cur_dir = sub_dirs.pop()
            new_files, new_sub_dirs = self.get_dir_content_and_subdirs(cur_dir)
            file_paths.extend(new_files)
            sub_dirs.extend(new_sub_dirs)

        return file_paths

    def make_dir(self, directory):
        """
        Creates a new directory in dcache

        :param dir:     The path to the directory to be created (including the name of the directory)
        :return:        The response from dCache
        """
        # make an MKCOL request to create a directory
        resp = requests.request(
            "MKCOL", self.url + directory, headers=self.get_headers(), timeout=5
        )
        return resp

    def get_file(self, path):
        """
        Gets the contents of a file from dCache

        :param dir:     Path to the file to get
        :return:        The file
        """
        # make a get request that streams the content from dcachce
        file = requests.get(
            self.url + path, stream=True, headers=self.get_headers(), timeout=5
        )
        return file

    def delete_file(self, path):
        """
        Deletes a file from dCache

        :param dir:     Path to the file to delete
        :return:        The response from dCache
        """
        # make a DELTE request to delte a file in dcache
        headers = self.get_headers()
        headers["Depth"] = "0"
        response = requests.delete(self.url + path, headers=headers, timeout=5)
        return response

    def upload_file(self, path, file):
        """
        Uploads a file to dCache

        :param dir:     Path to place the file
        :param file:    The file to upload
        :return:        The response from dCache
        """
        # make a PUT request to upload a file to dcache
        resp = requests.put(
            self.url + path, data=file.read(), headers=self.get_headers(), timeout=5
        )
        return resp

    def copy_or_move(self, initial_path, target_path, command="COPY"):
        """
        Copies a directory or file in dcache

        :param initial_path:        The path of the file/directory to copy
        :param target_path:         The path to copy to
        :param command:             COPY or MOVE values are accepted as the command
        :return:                    The response from dCache
        """
        headers = self.get_headers()
        headers["Destination"] = self.url + target_path
        # make a COPY request to copy a directory or file
        resp = requests.request(
            command, self.url + initial_path, headers=headers, timeout=5
        )
        return resp

import os

# Define the base directory for the views.
# You can change this if you want the "views" directory to be created elsewhere.
base_dir = "views"

# Define the directory structure as a list of paths.
# The os.path.join() function is used to create platform-independent paths.
# We include all subdirectories to ensure the full path is created.
directories = [
    os.path.join(base_dir, "layouts"),
    os.path.join(base_dir, "auth"),
    os.path.join(base_dir, "parking"),
    os.path.join(base_dir, "customer"),
    os.path.join(base_dir, "analytics")
]

# Define the files to be created within each directory.
# This is a dictionary where the key is the directory path and the value is a list of filenames.
files = {
    os.path.join(base_dir, "layouts"): ["header.html", "footer.html"],
    os.path.join(base_dir, "auth"): ["login.html", "register.html"],
    os.path.join(base_dir, "parking"): ["parking-lot.html", "parking-lots.html", "vehicle-entry.html", "vehicle-exit.html"],
    os.path.join(base_dir, "customer"): ["customer-list.html", "customer-profile.html"],
    os.path.join(base_dir, "analytics"): ["dashboard.html", "reports.html"],
    base_dir: ["index.html"]
}

print(f"Creating directory structure starting from '{base_dir}'...")

# Create all the directories first.
for directory in directories:
    # os.makedirs() creates all intermediate directories in the path.
    # The exist_ok=True argument prevents the function from raising an error
    # if the directory already exists.
    try:
        os.makedirs(directory, exist_ok=True)
        print(f"Directory created: {directory}")
    except OSError as e:
        print(f"Error creating directory {directory}: {e}")

# Now, create the files.
for directory, filenames in files.items():
    for filename in filenames:
        file_path = os.path.join(directory, filename)
        # Check if the file already exists before trying to create it.
        if not os.path.exists(file_path):
            try:
                # 'w' mode opens the file for writing, and creates it if it doesn't exist.
                # The 'with' statement ensures the file is closed automatically.
                with open(file_path, 'w') as f:
                    f.write(f"<!-- This is the content for {filename} -->")
                print(f"File created: {file_path}")
            except OSError as e:
                print(f"Error creating file {file_path}: {e}")
        else:
            print(f"File already exists, skipping: {file_path}")

print("\nDirectory structure creation complete.")

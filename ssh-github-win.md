https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account

1. ssh-keygen -t ed25519 -C "name@example.com"
2. eval `ssh-agent -s`
3. ssh-add "C:\Users\User Name\.ssh\id_ed25519"
4. cat "C:\Users\Lenovo T480s\.ssh\id_ed25519.pub" | clip
5. github.com > prophile photo > Settings
6. Access > New / Add SSH key

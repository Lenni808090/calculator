use tauri::Position;

#[derive(Debug, Clone)]
pub enum Tokentype{
    Number,
    Operator,
}
#[derive(Debug, Clone)]
pub struct Token {
    pub value: String,
    pub token_type: Tokentype
}

impl Token {
    pub fn new(value: String, token_type:Tokentype) -> Token{
        Token{
            value,
            token_type,
        }
    }
}

pub struct Lexer{
    input: Vec<char>,
    position: usize,
}

impl Lexer {
    pub fn new(input: Vec<char>) -> Lexer{
        Lexer{
            input,
            position: 0,
        }
    }

    pub fn at(&self) -> Option<char> {
        self.input.get(self.position).copied()
    }

    pub fn advance(&mut self) {
        self.position += 1;
    }

    pub fn is_at_end(&self) -> bool {
        self.position >= self.input.len()
    }


    pub fn tokenize(&mut self) -> Vec<Token>{
        let mut tokens: Vec<Token> = Vec::new();

        while !self.is_at_end() {
            if let Some(c) = self.at() {
                match c {
                    '+' | '-' | '*' | '/' => {
                        tokens.push(Token::new(c.to_string(), Tokentype::Operator));
                        self.advance();
                    }
                    '0'..='9' => {
                        let mut num = String::new();
                        if let Some(digit) = self.at() {
                            while digit.is_ascii_digit() {
                                num.push(digit);
                                self.advance();
                            }
                        }else {
                            break;
                        }
                    }
                    _ => {
                        panic!("Unexpected token");
                    }
                }
            }
        }
        tokens
    }
}




